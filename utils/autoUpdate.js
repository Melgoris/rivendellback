import {fetchDataFromGoogleT} from './fetchGoogleData.js'
import {updateParsedEvents} from '../controllers/EventController.js'

const startAutoUpdate = () => {
  setInterval(async () => {
    console.log('⏳ Автообновление событий...')

    try {
      const newEvents = await fetchDataFromGoogleT()
      if (!newEvents) {
        console.log('❌ Данные не получены, пропускаю обновление')
        return
      }

      // Фейковый req/res для вызова updateParsedEvents
      const fakeReq = {body: {events: newEvents}}
      const fakeRes = {
        status: () => ({
          json: data => console.log('Ответ сервера:', data),
        }),
      }

      await updateParsedEvents(fakeReq, fakeRes)
      console.log('✅ Данные успешно обновлены!')
    } catch (error) {
      console.error('❌ Ошибка при обновлении данных:', error)
    }
  }, 10 * 60 * 1000)
}

export default startAutoUpdate
