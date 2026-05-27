#!/usr/bin/env node

/**
 * Benchmark скрипт для измерения скорости сборки
 * 
 * Использование:
 * node benchmark.mjs
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'

const execAsync = promisify(exec)

const RUNS = 3 // Количество прогонов для усреднения
const CACHE_DIR = '.webpack-cache'
const BUILD_DIR = 'build'

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function clearCache() {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      fs.rmSync(CACHE_DIR, { recursive: true, force: true })
    }
    if (fs.existsSync(BUILD_DIR)) {
      fs.rmSync(BUILD_DIR, { recursive: true, force: true })
    }
    log('✓ Кэш очищен', colors.green)
  } catch (err) {
    log(`⚠ Ошибка очистки кэша: ${err.message}`, colors.yellow)
  }
}

async function measureBuild(label, withCache = false) {
  log(`\n${'='.repeat(60)}`, colors.cyan)
  log(`${label}`, colors.bright)
  log(`${'='.repeat(60)}`, colors.cyan)

  if (!withCache) {
    clearCache()
  }

  const times = []

  for (let i = 1; i <= RUNS; i++) {
    log(`\nПрогон ${i}/${RUNS}...`, colors.blue)

    const startTime = Date.now()

    try {
      const { stdout } = await execAsync('npm run build', {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      })

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      times.push(parseFloat(duration))

      log(`✓ Прогон ${i} завершен за ${duration}s`, colors.green)

      // Показываем таймеры из вывода Gulp
      const timers = stdout.match(/✓ .* compiled in [\d.]+s/g)
      if (timers) {
        timers.forEach(timer => log(`  ${timer}`, colors.cyan))
      }
    } catch (err) {
      log(`✗ Ошибка в прогоне ${i}: ${err.message}`, colors.yellow)
      log(err.stderr || err.stdout, colors.yellow)
      return null
    }

    // Между прогонами с кэшем не чистим
    if (!withCache && i < RUNS) {
      clearCache()
      await new Promise(resolve => setTimeout(resolve, 1000)) // Пауза 1 сек
    }
  }

  const avgTime = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)
  const minTime = Math.min(...times).toFixed(2)
  const maxTime = Math.max(...times).toFixed(2)

  log(`\n${'─'.repeat(60)}`, colors.cyan)
  log(`Результаты (${RUNS} прогонов):`, colors.bright)
  log(`  Среднее время: ${avgTime}s`, colors.green)
  log(`  Минимум: ${minTime}s`, colors.green)
  log(`  Максимум: ${maxTime}s`, colors.green)
  log(`${'─'.repeat(60)}`, colors.cyan)

  return {
    avg: parseFloat(avgTime),
    min: parseFloat(minTime),
    max: parseFloat(maxTime),
    times,
  }
}

async function main() {
  log('\n🚀 Benchmark сборки Gulp + Webpack', colors.bright)
  log('Это займет несколько минут...\n', colors.yellow)

  // Измеряем холодную сборку (без кэша)
  const coldBuild = await measureBuild('📦 Холодная сборка (без кэша)', false)

  if (!coldBuild) {
    log('\n✗ Benchmark прерван из-за ошибки', colors.yellow)
    process.exit(1)
  }

  // Измеряем теплую сборку (с кэшем)
  const warmBuild = await measureBuild('🔥 Теплая сборка (с кэшем)', true)

  if (!warmBuild) {
    log('\n✗ Benchmark прерван из-за ошибки', colors.yellow)
    process.exit(1)
  }

  // Итоговый отчет
  log('\n' + '='.repeat(60), colors.cyan)
  log('📊 ИТОГОВЫЙ ОТЧЕТ', colors.bright)
  log('='.repeat(60), colors.cyan)

  log('\nХолодная сборка (без кэша):', colors.bright)
  log(`  Среднее: ${coldBuild.avg}s`, colors.green)
  log(`  Диапазон: ${coldBuild.min}s - ${coldBuild.max}s`, colors.cyan)

  log('\nТеплая сборка (с кэшем):', colors.bright)
  log(`  Среднее: ${warmBuild.avg}s`, colors.green)
  log(`  Диапазон: ${warmBuild.min}s - ${warmBuild.max}s`, colors.cyan)

  const speedup = (coldBuild.avg / warmBuild.avg).toFixed(2)
  log(`\n⚡ Ускорение с кэшем: ${speedup}x`, colors.green)

  // Сохраняем результаты в файл
  const results = {
    timestamp: new Date().toISOString(),
    coldBuild,
    warmBuild,
    speedup: parseFloat(speedup),
  }

  fs.writeFileSync('benchmark-results.json', JSON.stringify(results, null, 2))
  log('\n✓ Результаты сохранены в benchmark-results.json', colors.green)

  log('\n' + '='.repeat(60) + '\n', colors.cyan)
}

main().catch(err => {
  log(`\n✗ Критическая ошибка: ${err.message}`, colors.yellow)
  console.error(err)
  process.exit(1)
})
