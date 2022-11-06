import axios from "axios";
import { BASE_URL } from "../constans";

class StudiesApi {
    constructor({ baseUrl, headers }) {
      this._url = baseUrl;
      this._headers = headers;
    }
  
    _checkResponse(res) {
      if (res.ok) {
        return res.json();
      }
  
      return Promise.reject(res);
    }
  
    // Базовый запрос без тела
    _fetch(way, methodName) {
      this._headers = {
        ...this._headers,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      return fetch(`${this._url}${way}`, {
        method: methodName,
        headers: this._headers,
      }).then(this._checkResponse);
    }
  
    // Запрос с телом
    _fetchWithBody(way, methodName, bodyContent) {
      this._headers = {
        ...this._headers,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      return fetch(`${this._url}${way}`, {
        method: methodName,
        // headers: this._headers,
        body: JSON.stringify(bodyContent),
      }).then(this._checkResponse);
    }
  
    // Получаем массив врачей
    getAllUsers() {
      //return this._fetch("/user/related", "GET");
      return this._fetch("/users/", "GET");
    }
  
    // Получаем массив исследований
    getAllStudies() {
        return this._fetch("/studies", "GET");
    }

    // Получаем массив исследований врача по id
    getUserStudies(userId) {
        //return this._fetch(`/studies/${userId}`, "GET");
        return this._fetch(`/studies/${userId}`, "GET");
    }

    // Создаем исследование
    addNewStudy(newStudy) {
      const config = {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      }
        return axios.put(this._url + "/upload/", newStudy, config)
    }

    // Редактируем исследование
    editStudy(studyId, newComment) {
        const config = {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
        return axios.patch(this._url + `/study/${studyId}`, newComment, config)
      }
  
    // Удаляем исследование
    deleteStudy(studyId) {
      console.log(studyId)
      return this._fetch(`/study/${studyId}`, "DELETE");
    }

    // Создаем новую генерацию
    newGeneration(generation) {
      return axios.post(this._url + "/generation/generate/", generation)
      // return this._fetchWithBody("/generation/generate/", "POST", formData)
    }

    downloadFile(url) {
      return this._fetch(url, "GET")
    }
    
  }
  

// Создаем класс апи
const studiesApi = new StudiesApi({
  baseUrl: BASE_URL + "api",
  headers: {
    "content-type": "application/json",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
  
export default studiesApi;
  