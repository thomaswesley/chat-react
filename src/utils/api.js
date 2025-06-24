import axios from 'axios'

const apiPaganaPizzaria = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_PAGANA_PIZZARIA_NODE
})

export { apiPaganaPizzaria }
