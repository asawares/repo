cmake_minimum_required(VERSION 3.15)
project(SAMPInjection LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

if(NOT DEFINED DETOURS_INCLUDE_DIR OR NOT DEFINED DETOURS_LIBRARY)
    message(FATAL_ERROR "Detours paths not defined! Use -DDETOURS_INCLUDE_DIR and -DDETOURS_LIBRARY")
endif()

add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

target_include_directories(SAMPInjection PRIVATE ${DETOURS_INCLUDE_DIR})
target_link_libraries(SAMPInjection PRIVATE ${DETOURS_LIBRARY})

if(MSVC)
    target_compile_options(SAMPInjection PRIVATE /W0 /EHsc)
endif()
