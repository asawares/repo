// Build: Win32 (x86), /MT (или как у игры), Detours 4.x
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>
#include <string>
#include <unordered_map>
#include <vector>
#include <fstream>
#include <algorithm>
#include "detours.h"
#pragma comment(lib, "detours.lib")

struct VFile {
    std::vector<uint8_t> data;
    size_t pos = 0;
};

static std::unordered_map<std::string, VFile> g_files;         // key: normalized path
static std::unordered_map<HANDLE, std::string> g_openFiles;    // fake handle -> key
static CRITICAL_SECTION g_cs;

static std::string norm(std::string s) {
    std::replace(s.begin(), s.end(), '\\', '/');
    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c){ return (char)std::tolower(c); });
    return s;
}

// ----- generate/recognize fake handles -----
static HANDLE make_fake_handle() {
#ifdef _WIN64
    static uint64_t ctr = 1;
    uint64_t val = 0xF00D000000000000ull | (ctr++ & 0xFFFFFFFFull);
    return (HANDLE)val;
#else
    static uint32_t ctr = 1;
    uint32_t val = 0xF00D0000u | (ctr++ & 0xFFFFu);
    return (HANDLE)val;
#endif
}
static bool is_fake(HANDLE h) {
#ifdef _WIN64
    return ( (uint64_t)h & 0xFFFF000000000000ull ) == 0xF00D000000000000ull;
#else
    return ( (uint32_t)h & 0xFFFF0000u ) == 0xF00D0000u;
#endif
}

// ===== real API pointers =====
using tCreateFileA = HANDLE (WINAPI*)(LPCSTR,DWORD,DWORD,LPSECURITY_ATTRIBUTES,DWORD,DWORD,HANDLE);
using tCreateFileW = HANDLE (WINAPI*)(LPCWSTR,DWORD,DWORD,LPSECURITY_ATTRIBUTES,DWORD,DWORD,HANDLE);
using tReadFile    = BOOL   (WINAPI*)(HANDLE,LPVOID,DWORD,LPDWORD,LPOVERLAPPED);
using tCloseHandle = BOOL   (WINAPI*)(HANDLE);
using tGetFileSize = DWORD  (WINAPI*)(HANDLE,LPDWORD);
using tGetFileSizeEx = BOOL (WINAPI*)(HANDLE, PLARGE_INTEGER);
using tSetFilePointer = DWORD (WINAPI*)(HANDLE, LONG, PLONG, DWORD);
using tSetFilePointerEx = BOOL (WINAPI*)(HANDLE, LARGE_INTEGER, PLARGE_INTEGER, DWORD);
using tGetFileType = DWORD  (WINAPI*)(HANDLE);

static tCreateFileA      oCreateFileA      = nullptr;
static tCreateFileW      oCreateFileW      = nullptr;
static tReadFile         oReadFile         = nullptr;
static tCloseHandle      oCloseHandle      = nullptr;
static tGetFileSize      oGetFileSize      = nullptr;
static tGetFileSizeEx    oGetFileSizeEx    = nullptr;
static tSetFilePointer   oSetFilePointer   = nullptr;
static tSetFilePointerEx oSetFilePointerEx = nullptr;
static tGetFileType      oGetFileType      = nullptr;

// ===== helpers =====
static bool find_virtual(std::string path, std::string& keyOut) {
    path = norm(path);
    for (auto& kv : g_files) {
        if (path.find(kv.first) != std::string::npos) { keyOut = kv.first; return true; }
    }
    return false;
}

static void load_to_memory(const std::string& virt, const std::wstring& real) {
    std::ifstream f(real, std::ios::binary);
    if (!f) return;
    std::vector<uint8_t> data((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
    VFile vf; vf.data = std::move(data); vf.pos = 0;
    g_files[norm(virt)] = std::move(vf);
}

static void load_resources() {
    // подстройте реальные пути под своё расположение
    wchar_t modulePath[MAX_PATH]{};
    GetModuleFileNameW((HMODULE)&__ImageBase, modulePath, MAX_PATH);
    std::wstring base(modulePath);
    auto slash = base.find_last_of(L"\\/");
    if (slash != std::wstring::npos) base.resize(slash+1);

    auto p = [&](const wchar_t* rel)->std::wstring{ return base + rel; };

    // HTML
    load_to_memory("uiresources/index.html", p(L"resources\\index.html"));
    load_to_memory("uiresources/alcatara-workshop/weapons/1.html", p(L"resources\\weapons\\ak47.html"));
    load_to_memory("uiresources/alcatara-workshop/weapons/2.html", p(L"resources\\weapons\\m4a1.html"));
    load_to_memory("uiresources/alcatara-workshop/limons/3.html",   p(L"resources\\limons\\classic.html"));
    load_to_memory("uiresources/alcatara-workshop/limons/4.html",   p(L"resources\\limons\\premium.html"));

    // PNG
    load_to_memory("uiresources/alcatara-workshop/weapons/0.png", p(L"resources\\icons\\ak47.png"));
    load_to_memory("uiresources/alcatara-workshop/icons/2.png",   p(L"resources\\icons\\m4a1.png"));
    load_to_memory("uiresources/alcatara-workshop/icons/3.png",   p(L"resources\\icons\\knife.png"));
    load_to_memory("uiresources/alcatara-workshop/icons/4.png",   p(L"resources\\icons\\deagle.png"));
    load_to_memory("uiresources/alcatara-workshop/icons/5.png",   p(L"resources\\icons\\awp.png"));
    load_to_memory("uiresources/alcatara-workshop/icons/glock.png",p(L"resources\\icons\\glock.png"));
}

// ===== Hooks =====
HANDLE WINAPI hkCreateFileA(LPCSTR name, DWORD acc, DWORD share, LPSECURITY_ATTRIBUTES sa, DWORD disp, DWORD flags, HANDLE tmpl) {
    std::string key;
    if (name && find_virtual(name, key)) {
        EnterCriticalSection(&g_cs);
        HANDLE h = make_fake_handle();
        g_openFiles[h] = key;
        g_files[key].pos = 0;
        LeaveCriticalSection(&g_cs);
        SetLastError(ERROR_SUCCESS);
        return h;
    }
    return oCreateFileA(name, acc, share, sa, disp, flags, tmpl);
}

HANDLE WINAPI hkCreateFileW(LPCWSTR name, DWORD acc, DWORD share, LPSECURITY_ATTRIBUTES sa, DWORD disp, DWORD flags, HANDLE tmpl) {
    std::string key;
    if (name) {
        int len = lstrlenW(name);
        std::string utf8; utf8.resize(len*3+1);
        int out = WideCharToMultiByte(CP_UTF8,0,name,len,utf8.data(),(int)utf8.size(),NULL,NULL);
        utf8.resize(out > 0 ? out : 0);
        if (find_virtual(utf8, key)) {
            EnterCriticalSection(&g_cs);
            HANDLE h = make_fake_handle();
            g_openFiles[h] = key;
            g_files[key].pos = 0;
            LeaveCriticalSection(&g_cs);
            SetLastError(ERROR_SUCCESS);
            return h;
        }
    }
    return oCreateFileW(name, acc, share, sa, disp, flags, tmpl);
}

BOOL WINAPI hkReadFile(HANDLE h, LPVOID buf, DWORD toRead, LPDWORD read, LPOVERLAPPED ov) {
    if (is_fake(h)) {
        EnterCriticalSection(&g_cs);
        auto itH = g_openFiles.find(h);
        if (itH == g_openFiles.end()) { LeaveCriticalSection(&g_cs); SetLastError(ERROR_INVALID_HANDLE); return FALSE; }
        VFile& vf = g_files[itH->second];
        size_t avail = vf.data.size() > vf.pos ? vf.data.size() - vf.pos : 0;
        size_t n = (size_t)toRead < avail ? (size_t)toRead : avail;
        if (n && buf) memcpy(buf, vf.data.data() + vf.pos, n);
        vf.pos += n;
        LeaveCriticalSection(&g_cs);
        if (read) *read = (DWORD)n;
        SetLastError(ERROR_SUCCESS);
        return TRUE;
    }
    return oReadFile(h, buf, toRead, read, ov);
}

BOOL WINAPI hkCloseHandle(HANDLE h) {
    if (is_fake(h)) {
        EnterCriticalSection(&g_cs);
        g_openFiles.erase(h);
        LeaveCriticalSection(&g_cs);
        SetLastError(ERROR_SUCCESS);
        return TRUE;
    }
    return oCloseHandle(h);
}

DWORD WINAPI hkGetFileType(HANDLE h) {
    if (is_fake(h)) return FILE_TYPE_DISK;
    return oGetFileType(h);
}

DWORD WINAPI hkGetFileSize(HANDLE h, LPDWORD high) {
    if (is_fake(h)) {
        EnterCriticalSection(&g_cs);
        auto itH = g_openFiles.find(h);
        if (itH == g_openFiles.end()) { LeaveCriticalSection(&g_cs); SetLastError(ERROR_INVALID_HANDLE); return INVALID_FILE_SIZE; }
        uint64_t sz = g_files[itH->second].data.size();
        LeaveCriticalSection(&g_cs);
        if (high) *high = (DWORD)(sz >> 32);
        return (DWORD)(sz & 0xFFFFFFFF);
    }
    return oGetFileSize(h, high);
}

BOOL WINAPI hkGetFileSizeEx(HANDLE h, PLARGE_INTEGER out) {
    if (is_fake(h)) {
        if (!out) { SetLastError(ERROR_INVALID_PARAMETER); return FALSE; }
        EnterCriticalSection(&g_cs);
        auto itH = g_openFiles.find(h);
        if (itH == g_openFiles.end()) { LeaveCriticalSection(&g_cs); SetLastError(ERROR_INVALID_HANDLE); return FALSE; }
        out->QuadPart = (LONGLONG)g_files[itH->second].data.size();
        LeaveCriticalSection(&g_cs);
        SetLastError(ERROR_SUCCESS);
        return TRUE;
    }
    return oGetFileSizeEx(h, out);
}

DWORD WINAPI hkSetFilePointer(HANDLE h, LONG dist, PLONG high, DWORD method) {
    if (is_fake(h)) {
        LARGE_INTEGER move; move.LowPart = dist; move.HighPart = (high ? *high : (LONG)((dist<0)?-1:0));
        LARGE_INTEGER newpos{};
        if (!hkSetFilePointerEx(h, move, &newpos, method)) return INVALID_SET_FILE_POINTER;
        if (high) *high = newpos.HighPart;
        return newpos.LowPart;
    }
    return oSetFilePointer(h, dist, high, method);
}

BOOL WINAPI hkSetFilePointerEx(HANDLE h, LARGE_INTEGER dist, PLARGE_INTEGER newpos, DWORD method) {
    if (is_fake(h)) {
        EnterCriticalSection(&g_cs);
        auto itH = g_openFiles.find(h);
        if (itH == g_openFiles.end()) { LeaveCriticalSection(&g_cs); SetLastError(ERROR_INVALID_HANDLE); return FALSE; }
        VFile& vf = g_files[itH->second];
        int64_t base = 0;
        if (method == FILE_CURRENT) base = (int64_t)vf.pos;
        else if (method == FILE_END) base = (int64_t)vf.data.size();
        int64_t np = base + dist.QuadPart;
        if (np < 0) np = 0;
        if ((size_t)np > vf.data.size()) np = (int64_t)vf.data.size();
        vf.pos = (size_t)np;
        if (newpos) newpos->QuadPart = (LONGLONG)vf.pos;
        LeaveCriticalSection(&g_cs);
        SetLastError(ERROR_SUCCESS);
        return TRUE;
    }
    return oSetFilePointerEx(h, dist, newpos, method);
}

// ===== attach/detach =====
static bool Attach() {
    DetourRestoreAfterWith();
    if (DetourTransactionBegin() != NO_ERROR) return false;
    DetourUpdateThread(GetCurrentThread());

    oCreateFileA      = CreateFileA;
    oCreateFileW      = CreateFileW;
    oReadFile         = ReadFile;
    oCloseHandle      = CloseHandle;
    oGetFileType      = GetFileType;
    oGetFileSize      = GetFileSize;
    oGetFileSizeEx    = GetFileSizeEx;
    oSetFilePointer   = SetFilePointer;
    oSetFilePointerEx = SetFilePointerEx;

    DetourAttach(&(PVOID&)oCreateFileA,      hkCreateFileA);
    DetourAttach(&(PVOID&)oCreateFileW,      hkCreateFileW);
    DetourAttach(&(PVOID&)oReadFile,         hkReadFile);
    DetourAttach(&(PVOID&)oCloseHandle,      hkCloseHandle);
    DetourAttach(&(PVOID&)oGetFileType,      hkGetFileType);
    DetourAttach(&(PVOID&)oGetFileSize,      hkGetFileSize);
    DetourAttach(&(PVOID&)oGetFileSizeEx,    hkGetFileSizeEx);
    DetourAttach(&(PVOID&)oSetFilePointer,   hkSetFilePointer);
    DetourAttach(&(PVOID&)oSetFilePointerEx, hkSetFilePointerEx);

    LONG err = DetourTransactionCommit();
    return (err == NO_ERROR);
}

static DWORD WINAPI InitThread(LPVOID) {
    InitializeCriticalSection(&g_cs);
    load_resources();           // безопасно тут, а не в DllMain
    Attach();
    return 0;
}

// ===== DllMain =====
extern "C" IMAGE_DOS_HEADER __ImageBase;
BOOL APIENTRY DllMain(HMODULE hModule, DWORD reason, LPVOID) {
    if (reason == DLL_PROCESS_ATTACH) {
        DisableThreadLibraryCalls(hModule);
        CreateThread(nullptr, 0, InitThread, nullptr, 0, nullptr);
    }
    return TRUE;
}
