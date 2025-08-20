cmake_minimum_required(VERSION 3.15)
project(SAMPInjection LANGUAGES CXX RC)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

# УБИРАЕМ проверку Detours полностью!
set(DETOURS_ROOT ${CMAKE_SOURCE_DIR}/Detours-main)

# Просто предупреждение вместо ошибки
if(NOT EXISTS ${DETOURS_ROOT}/lib.X64/detours.lib)
    message(WARNING "Detours library not found - building without it")
else()
    message(STATUS "Found detours.lib")
    target_link_libraries(SAMPInjection ${DETOURS_ROOT}/lib.X64/detours.lib)
endif()

add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

# Добавляем include директорию
target_include_directories(SAMPInjection PRIVATE 
    ${DETOURS_ROOT}/src
    ${CMAKE_SOURCE_DIR}/src
)

# Для MSVC
if(MSVC)
    target_compile_options(SAMPInjection PRIVATE 
        /W0
        /EHsc
        /D_CRT_SECURE_NO_WARNINGS
        /D_WINDOWS
    )
endif()

# Копируем ресурсы
file(COPY resources/ DESTINATION ${CMAKE_BINARY_DIR}/resources)
