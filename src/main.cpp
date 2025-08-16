#include <Windows.h>
#include <string>
#include <algorithm>
#include "detours.h"

#pragma comment(lib, "detours.lib")

// Загрузка встроенных ресурсов
std::string GetResourceAsString(int resourceId) {
    HRSRC hRes = FindResourceA(NULL, MAKEINTRESOURCEA(resourceId), RT_RCDATA);
    if (!hRes) return "";
    
    HGLOBAL hData = LoadResource(NULL, hRes);
    if (!hData) return "";
    
    DWORD size = SizeofResource(NULL, hRes);
    return std::string((const char*)LockResource(hData), size);
}

// Глобальные переменные
std::string VIRTUAL_HTML;
std::string VIRTUAL_JS;

// ========= Хуки =========
typedef HANDLE(WINAPI* tCreateFileA)(LPCSTR, DWORD, DWORD, LPSECURITY_ATTRIBUTES, DWORD, DWORD, HANDLE);
tCreateFileA oCreateFileA = nullptr;

HANDLE WINAPI HookedCreateFileA(
    LPCSTR lpFileName,
    DWORD dwDesiredAccess,
    DWORD dwShareMode,
    LPSECURITY_ATTRIBUTES lpSecurityAttributes,
    DWORD dwCreationDisposition,
    DWORD dwFlagsAndAttributes,
    HANDLE hTemplateFile
) {
    std::string path(lpFileName);
    std::replace(path.begin(), path.end(), '\\', '/');

    // Подмена путей
    if (path.find("uiresources/index.html") != std::string::npos) {
        return (HANDLE)0x1337;
    }
    if (path.find("uiresources/assets/custom.js") != std::string::npos) {
        return (HANDLE)0x1338;
    }

    return oCreateFileA(lpFileName, dwDesiredAccess, dwShareMode, lpSecurityAttributes,
                       dwCreationDisposition, dwFlagsAndAttributes, hTemplateFile);
}

typedef BOOL(WINAPI* tReadFile)(HANDLE, LPVOID, DWORD, LPDWORD, LPOVERLAPPED);
tReadFile oReadFile = nullptr;

BOOL WINAPI HookedReadFile(
    HANDLE hFile,
    LPVOID lpBuffer,
    DWORD nNumberOfBytesToRead,
    LPDWORD lpNumberOfBytesRead,
    LPOVERLAPPED lpOverlapped
) {
    // Подмена HTML
    if (hFile == (HANDLE)0x1337) {
        memcpy(lpBuffer, VIRTUAL_HTML.c_str(), min(VIRTUAL_HTML.size(), nNumberOfBytesToRead));
        *lpNumberOfBytesRead = (DWORD)VIRTUAL_HTML.size();
        return TRUE;
    }
    
    // Подмена JS
    if (hFile == (HANDLE)0x1338) {
        memcpy(lpBuffer, VIRTUAL_JS.c_str(), min(VIRTUAL_JS.size(), nNumberOfBytesToRead));
        *lpNumberOfBytesRead = (DWORD)VIRTUAL_JS.size();
        return TRUE;
    }

    return oReadFile(hFile, lpBuffer, nNumberOfBytesToRead, lpNumberOfBytesRead, lpOverlapped);
}

// ========= Точка входа =========
BOOL APIENTRY DllMain(HMODULE hModule, DWORD reason, LPVOID lpReserved) {
    if (reason == DLL_PROCESS_ATTACH) {
        // Загрузка ресурсов
        VIRTUAL_HTML = GetResourceAsString(1000); // IDR_HTML
        VIRTUAL_JS = GetResourceAsString(1001);   // IDR_JS

        if (VIRTUAL_HTML.empty() || VIRTUAL_JS.empty()) {
            MessageBoxA(0, "Failed to load resources!", "Error", MB_ICONERROR);
            return FALSE;
        }

        // Инициализация Detours
        DetourRestoreAfterWith();
        DetourTransactionBegin();
        DetourUpdateThread(GetCurrentThread());

        // Хук CreateFileA
        oCreateFileA = (tCreateFileA)DetourFindFunction("kernel32.dll", "CreateFileA");
        DetourAttach(&(PVOID&)oCreateFileA, HookedCreateFileA);

        // Хук ReadFile
        oReadFile = (tReadFile)DetourFindFunction("kernel32.dll", "ReadFile");
        DetourAttach(&(PVOID&)oReadFile, HookedReadFile);

        DetourTransactionCommit();
    }
    return TRUE;
}
