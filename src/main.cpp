#include <Windows.h>
#include <string>
#include <algorithm>
#include <map>
#include <vector>
#include <fstream>
#include "detours.h"

#pragma comment(lib, "detours.lib")

// Структура для хранения файлов
struct VirtualFile {
    std::vector<BYTE> data;
    size_t size;
};

std::map<std::string, VirtualFile> VIRTUAL_FILES;

// ========= ХУКИ =========
typedef HANDLE(WINAPI* tCreateFileA)(LPCSTR, DWORD, DWORD, LPSECURITY_ATTRIBUTES, DWORD, DWORD, HANDLE);
tCreateFileA oCreateFileA = nullptr;

HANDLE WINAPI HookedCreateFileA(LPCSTR lpFileName, DWORD dwDesiredAccess, DWORD dwShareMode, 
                              LPSECURITY_ATTRIBUTES lpSecurityAttributes, DWORD dwCreationDisposition,
                              DWORD dwFlagsAndAttributes, HANDLE hTemplateFile) {
    std::string path(lpFileName);
    std::replace(path.begin(), path.end(), '\\', '/');

    // Ищем виртуальный файл
    for (const auto& file : VIRTUAL_FILES) {
        if (path.find(file.first) != std::string::npos) {
            return (HANDLE)(1000 + std::distance(VIRTUAL_FILES.begin(), VIRTUAL_FILES.find(file.first)));
        }
    }

    return oCreateFileA(lpFileName, dwDesiredAccess, dwShareMode, lpSecurityAttributes,
                       dwCreationDisposition, dwFlagsAndAttributes, hTemplateFile);
}

typedef BOOL(WINAPI* tReadFile)(HANDLE, LPVOID, DWORD, LPDWORD, LPOVERLAPPED);
tReadFile oReadFile = nullptr;

BOOL WINAPI HookedReadFile(HANDLE hFile, LPVOID lpBuffer, DWORD nNumberOfBytesToRead, 
                         LPDWORD lpNumberOfBytesRead, LPOVERLAPPED lpOverlapped) {
    // Проверяем виртуальные файлы
    for (size_t i = 0; i < VIRTUAL_FILES.size(); ++i) {
        if (hFile == (HANDLE)(1000 + i)) {
            auto it = std::next(VIRTUAL_FILES.begin(), i);
            size_t bytesToCopy = min(it->second.size, (size_t)nNumberOfBytesToRead);
            memcpy(lpBuffer, it->second.data.data(), bytesToCopy);
            *lpNumberOfBytesRead = (DWORD)bytesToCopy;
            return TRUE;
        }
    }

    return oReadFile(hFile, lpBuffer, nNumberOfBytesToRead, lpNumberOfBytesRead, lpOverlapped);
}

// ========= ЗАГРУЗКА ФАЙЛОВ =========
void LoadFileToMemory(const std::string& virtualPath, const std::string& realPath) {
    std::ifstream file(realPath, std::ios::binary);
    if (!file) {
        MessageBoxA(0, ("Failed to load: " + realPath).c_str(), "Error", MB_ICONERROR);
        return;
    }
    
    std::vector<BYTE> data((std::istreambuf_iterator<char>(file)), 
                          std::istreambuf_iterator<char>());
    
    VIRTUAL_FILES[virtualPath] = {data, data.size()};
}

void LoadResources() {
    // HTML файлы
    LoadFileToMemory("uiresources/index.html", "resources/index.html");
    LoadFileToMemory("uiresources/Alcatara-Workshop/weapons/1.html", "resources/weapons/ak47.html");
    LoadFileToMemory("uiresources/Alcatara-Workshop/weapons/2.html", "resources/weapons/m4a1.html");
    LoadFileToMemory("uiresources/Alcatara-Workshop/limons/3.html", "resources/limons/classic.html");
    LoadFileToMemory("uiresources/Alcatara-Workshop/limons/4.html", "resources/limons/premium.html");

    // PNG иконки
    LoadFileToMemory("uiresources/Alcatara-Workshop/weapons/0.png", "resources/icons/ak47.png");
    LoadFileToMemory("uiresources/Alcatara-Workshop/icons/2.png", "resources/icons/m4a1.png");
    LoadFileToMemory("uiresources/Alcatara-Workshop/icons/3.png", "resources/icons/knife.png");
    LoadFileToMemory("uiresources/Alcatara-Workshop/icons/4.png", "resources/icons/deagle.png");
    LoadFileToMemory("uiresources/Alcatara-Workshop/icons/5.png", "resources/icons/awp.png");
    LoadFileToMemory("uiresources/Alcatara-Workshop/icons/glock.png", "resources/icons/glock.png");
}

// ========= ТОЧКА ВХОДА =========
BOOL APIENTRY DllMain(HMODULE hModule, DWORD reason, LPVOID lpReserved) {
    if (reason == DLL_PROCESS_ATTACH) {
        LoadResources();

        DetourRestoreAfterWith();
        DetourTransactionBegin();
        DetourUpdateThread(GetCurrentThread());

        oCreateFileA = (tCreateFileA)DetourFindFunction("kernel32.dll", "CreateFileA");
        DetourAttach(&(PVOID&)oCreateFileA, HookedCreateFileA);

        oReadFile = (tReadFile)DetourFindFunction("kernel32.dll", "ReadFile");
        DetourAttach(&(PVOID&)oReadFile, HookedReadFile);

        DetourTransactionCommit();
    }
    return TRUE;
}
