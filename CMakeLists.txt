cmake_minimum_required(VERSION 3.15)
project(SAMPInjection LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

# Автоматический поиск Detours
set(DETOURS_ROOT ${CMAKE_SOURCE_DIR}/Detours-main)
set(DETOURS_INCLUDE_DIR ${DETOURS_ROOT}/src)
set(DETOURS_LIBRARY ${DETOURS_ROOT}/lib.X64/detours.lib)

if(NOT EXISTS ${DETOURS_LIBRARY})
    message(FATAL_ERROR "Detours not built! Run 'nmake' in Detours-main folder first")
endif()

add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

target_include_directories(SAMPInjection PRIVATE ${DETOURS_INCLUDE_DIR})
target_link_libraries(SAMPInjection PRIVATE ${DETOURS_LIBRARY})

if(MSVC)
    target_compile_options(SAMPInjection PRIVATE /W0 /EHsc /D_CRT_SECURE_NO_WARNINGS)
endif()
