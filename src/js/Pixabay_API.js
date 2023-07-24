import axios from 'axios';

export async function makeRequest(searchQuery, page) {
  const API_KEY = "38353563-faefe35241da6d2bdd21486de";
  const BASE_URL = 'https://pixabay.com/api/'; 
  // axios.defaults.headers.common["x-api-key"] = API_KEY;
  // axios.defaults.baseURL =  'https://pixabay.com/api/'; 

  const URL = `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;
  const response = await axios.get(URL);

    return response.data;
    // const response = await fetch(`https://pixabay.com/api/?key=38353563-faefe35241da6d2bdd21486de&q=${pixInform}&image_type=photo&orientation=horizontal&safesearch=true`);
    // return response.json();
}

