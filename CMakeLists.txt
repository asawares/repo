cmake_minimum_required(VERSION 3.15)
project(SAMPInjection)

# Настройки ASI
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_SHARED_LIBRARY_SUFFIX ".asi")

# Пути к Detours
set(DETOURS_ROOT ${CMAKE_SOURCE_DIR}/Detours-main)
set(DETOURS_INCLUDE ${DETOURS_ROOT}/src)

# Сначала собираем Detours
add_custom_command(
    OUTPUT ${DETOURS_ROOT}/lib.X64/detours.lib
    COMMAND nmake
    WORKING_DIRECTORY ${DETOURS_ROOT}
)

# Основной плагин
add_library(SAMPInjection SHARED 
    src/main.cpp
    src/resources.rc
)

# Зависимости и линковка
add_dependencies(SAMPInjection ${DETOURS_ROOT}/lib.X64/detours.lib)
target_include_directories(SAMPInjection PRIVATE ${DETOURS_INCLUDE})
target_link_libraries(SAMPInjection PRIVATE ${DETOURS_ROOT}/lib.X64/detours.lib)

# Для MSVC
if(MSVC)
    target_compile_options(SAMPInjection PRIVATE /W0 /EHsc)
endif()
