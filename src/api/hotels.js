import Axios from  "axios-observable"
import { map, catchError } from "rxjs/operators"

const api = process.env.VUE_APP_API_SERVER

export default {
  getHotels() {
    return Axios.get(`${api}/mock/hotels.json`).pipe(
      map(resp => {
        return resp.data
      }),
      catchError(error => {
        throw error
      })
    )
  }
}

