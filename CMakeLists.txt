cmake_minimum_required(VERSION 3.15)
project(SAMPInjection LANGUAGES CXX RC)

# Настройки ASI плагина
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

# Пути к Detours
set(DETOURS_ROOT ${CMAKE_SOURCE_DIR}/Detours-main)
set(DETOURS_INCLUDE_DIR ${DETOURS_ROOT}/src)
set(DETOURS_LIBRARY ${DETOURS_ROOT}/lib.X64/detours.lib)

# Проверка наличия Detours
if(NOT EXISTS ${DETOURS_LIBRARY})
    message(FATAL_ERROR "Detours library not found! Build Detours first with: cd Detours-main && nmake")
endif()

if(NOT EXISTS ${DETOURS_INCLUDE_DIR}/detours.h)
    message(FATAL_ERROR "Detours headers not found!")
endif()

# Основная библиотека
add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

# Настройки компиляции
target_include_directories(SAMPInjection PRIVATE 
    ${DETOURS_INCLUDE_DIR}
    ${CMAKE_SOURCE_DIR}/src
)

target_link_libraries(SAMPInjection ${DETOURS_LIBRARY})

# Настройки для MSVC
if(MSVC)
    target_compile_options(SAMPInjection PRIVATE 
        /W0
        /EHsc
        /D_CRT_SECURE_NO_WARNINGS
        /D_WINDOWS
        /D_USRDLL
    )
    
    target_link_options(SAMPInjection PRIVATE
        /DEBUG
        /DYNAMICBASE
        /NXCOMPAT
    )
endif()

# Копирование ресурсов для проверки
file(COPY resources/ DESTINATION ${CMAKE_BINARY_DIR}/resources)

# Информация о сборке
message(STATUS "Detours include: ${DETOURS_INCLUDE_DIR}")
message(STATUS "Detours library: ${DETOURS_LIBRARY}")
message(STATUS "Output file: ${CMAKE_SHARED_LIBRARY_PREFIX}SAMPInjection${CMAKE_SHARED_LIBRARY_SUFFIX}")
