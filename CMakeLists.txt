cmake_minimum_required(VERSION 3.15)
project(radmir_virtualfs LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS ON)

# --- Сборка Detours ---
add_library(detours STATIC
    Detours-main/src/disasm.cpp
    Detours-main/src/detours.cpp
    Detours-main/src/modules.cpp
    Detours-main/src/creatwth.cpp
)

# Include для Detours
target_include_directories(detours PUBLIC Detours-main/include)

# --- Сборка DLL ---
add_library(radmir_virtualfs SHARED
    src/dllmain.cpp
    src/resources.rc
)

# Передаем include путь из Detours и линкуем
target_include_directories(radmir_virtualfs PRIVATE Detours-main/include)
target_link_libraries(radmir_virtualfs PRIVATE detours)
