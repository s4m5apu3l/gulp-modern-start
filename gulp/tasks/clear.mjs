/**
 * Удаления продакшен версии проекта
 *
 * Полностью удаляет каталог build
 */

// Библиотеки
import { deleteAsync } from 'del'

// Конфиги
import config from '../config.mjs'

// Запуск таска
const clear = () => deleteAsync([config.build.root])

export default clear
