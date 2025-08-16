cmake_minimum_required(VERSION 3.15)
project(SAMPInjection LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

# Пути к Detours
set(DETOURS_INCLUDE_DIR ${CMAKE_SOURCE_DIR}/Detours/src)
set(DETOURS_LIBRARY ${CMAKE_SOURCE_DIR}/Detours/lib.X64/detours.lib)

# Проверка наличия Detours
if(NOT EXISTS ${DETOURS_LIBRARY})
    message(FATAL_ERROR "Detours not built! Run 'nmake' in Detours folder first")
endif()

# Основной плагин
add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

target_include_directories(SAMPInjection PRIVATE ${DETOURS_INCLUDE_DIR})
target_link_libraries(SAMPInjection PRIVATE ${DETOURS_LIBRARY})

if(MSVC)
    target_compile_options(SAMPInjection PRIVATE /W0 /EHsc /D_CRT_SECURE_NO_WARNINGS)
endif()
