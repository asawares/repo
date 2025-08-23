cmake_minimum_required(VERSION 3.15)
project(radmir_virtualfs LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS ON)

add_library(radmir_virtualfs SHARED
    src/dllmain.cpp
)

# Заголовки Detours
target_include_directories(radmir_virtualfs PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/Detours-main/include
)

# Линкуем Detours (x86)
target_link_libraries(radmir_virtualfs
    ${CMAKE_CURRENT_SOURCE_DIR}/Detours-main/lib.X86/detours.lib
)
