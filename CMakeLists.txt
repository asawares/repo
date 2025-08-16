cmake_minimum_required(VERSION 3.15)
project(SAMPInjection)

# Настройки ASI
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

# Пути к Detours (с учётом Detours-main)
set(DETOURS_ROOT ${CMAKE_SOURCE_DIR}/Detours-main)
set(DETOURS_INCLUDE ${DETOURS_ROOT}/src)
set(DETOURS_LIB ${DETOURS_ROOT}/lib.X64/detours.lib)

# Проверка наличия Detours
if(NOT EXISTS ${DETOURS_INCLUDE}/detours.h)
    message(FATAL_ERROR "Detours not found! Expected at: ${DETOURS_ROOT}")
endif()

# Основной плагин
add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

# Подключение Detours
target_include_directories(SAMPInjection PRIVATE ${DETOURS_INCLUDE})
target_link_libraries(SAMPInjection PRIVATE ${DETOURS_LIB})

# Для MSVC
if(MSVC)
    target_compile_options(SAMPInjection PRIVATE /W0 /EHsc /D_CRT_SECURE_NO_WARNINGS)
endif()
