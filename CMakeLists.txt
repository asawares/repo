cmake_minimum_required(VERSION 3.15)
project(SAMPInjection LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

# Пути к Detours
set(DETOURS_ROOT ${CMAKE_SOURCE_DIR}/Detours-main)
include_directories(${DETOURS_ROOT}/src)

add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

target_link_libraries(SAMPInjection ${DETOURS_ROOT}/lib.X64/detours.lib)

if(MSVC)
    target_compile_options(SAMPInjection PRIVATE /W0 /EHsc)
endif()
