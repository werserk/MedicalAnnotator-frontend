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
      return fetch(`${this._url}${way}`, {
        method: methodName,
        headers: this._headers,
      }).then(this._checkResponse);
    }
  
    // Запрос с телом
    _fetchWithBody(way, methodName, bodyContent) {
      return fetch(`${this._url}${way}`, {
        method: methodName,
        headers: this._headers,
        body: JSON.stringify(bodyContent),
      }).then(this._checkResponse);
    }
  
    // Получаем массив врачей
    getAllUsers() {
      this._headers = {
        ...this._headers,
        authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      return this._fetch("/user/related", "GET");
      //return this._fetch("/users", "GET");
    }
  
    // Получаем массив исследований
    getAllStudies() {
        this._headers = {
          ...this._headers,
          authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        return this._fetch("/studies", "GET");
    }

    // Создаем исследование
    addNewStudy(newStudy) {
        return this._fetchWithBody("/studies", "POST", newStudy);
    }

    // Редактируем исследование
    editStudy(studyId, newComment) {
        return this._fetch(`/studies/${studyId}`, "PATCH", newComment);
      }
  
    // Удаляем исследование
    deleteStudy(studyId) {
      return this._fetch(`/studies/${studyId}`, "DELETE");
    }
  }
  
  // Создаем класс апи
  const studiesApi = new StudiesApi({
    baseUrl: "https://6364f07d7b209ece0f52bf14.mockapi.io/api",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  
  export default studiesApi;
  