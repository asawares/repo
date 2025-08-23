#define WIN32_LEAN_AND_MEAN
#include <Windows.h>
#include <string>
#include <map>
#include <vector>
#include "detours.h"

#pragma comment(lib, "detours.lib")

struct VirtualFile {
    std::vector<BYTE> data;
    size_t size;
};

std::map<std::string, VirtualFile> VIRTUAL_FILES;

// ====== Функция загрузки ресурса из DLL ======
void LoadResourceToMemory(const std::string& virtualPath, int resourceId) {
    HMODULE hModule = GetModuleHandleA("radmir_virtualfs.dll"); // имя DLL
    if (!hModule) hModule = GetModuleHandle(NULL);

    HRSRC hRes = FindResource(hModule, MAKEINTRESOURCE(resourceId), RT_RCDATA);
    if (!hRes) return;

    HGLOBAL hData = LoadResource(hModule, hRes);
    if (!hData) return;

    DWORD size = SizeofResource(hModule, hRes);
    void* pData = LockResource(hData);

    std::vector<BYTE> buffer((BYTE*)pData, (BYTE*)pData + size);
    VIRTUAL_FILES[virtualPath] = {buffer, buffer.size()};
}

// ====== Загрузка всех ресурсов ======
void LoadResources() {
    // HTML
    LoadResourceToMemory("uiresources/index.html", IDR_INDEX_HTML);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/weapons/1.html", IDR_AK47_HTML);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/weapons/2.html", IDR_M4A1_HTML);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/limons/3.html", IDR_CLASSIC_HTML);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/limons/4.html", IDR_PREMIUM_HTML);

    // PNG
    LoadResourceToMemory("uiresources/Alcatara-Workshop/weapons/0.png", IDR_AK47_PNG);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/icons/2.png", IDR_M4A1_PNG);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/icons/3.png", IDR_KNIFE_PNG);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/icons/4.png", IDR_DEAGLE_PNG);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/icons/5.png", IDR_AWP_PNG);
    LoadResourceToMemory("uiresources/Alcatara-Workshop/icons/glock.png", IDR_GLOCK_PNG);
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
