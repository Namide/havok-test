import Router from './router/Router'
import './style.css'
import App from './views/App'

const router = Router()

router.on('landing', () => console.log('landing'))
router.on('404', () => console.log('404'))

const app = App()

router.changePage({
  path: document.location.pathname
})


