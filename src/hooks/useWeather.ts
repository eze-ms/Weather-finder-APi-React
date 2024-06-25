import axios from "axios";
import { z } from 'zod';
import { SearchType } from '../types/index';
import { useState, useMemo } from "react";

const WeatherSchema = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number()
    })
});

export type Weather = z.infer<typeof WeatherSchema>;

const initialState: Weather = {
    name: '',
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0
    }
};

export default function useWeather() {
    const [weather, setWeather] = useState<Weather>(initialState);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const fetchWeather = async (search: SearchType) => {
        const appId = import.meta.env.VITE_API_KEY;
        setLoading(true);
        setWeather(initialState);


        try {
            // Obtener coordenadas geográficas de la ciudad y país especificados
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&limit=1&type=like&appid=${appId}`;
            const { data: geoData } = await axios(geoUrl);

            // Comprobar si no se encontró la ciudad
            if(!geoData[0]) {
                setNotFound(true)
                return
            } 

            const { lat, lon } = geoData[0];
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;
            
            const { data: weatherResult } = await axios(weatherUrl);
            const result = WeatherSchema.safeParse(weatherResult);

            if (result.success) {
                setWeather(result.data);
            } else {
                console.log('Validation failed');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const hasWeatherData = useMemo(() => !!weather.name, [weather]);

    return {
        weather,
        loading,
        notFound,
        fetchWeather,
        hasWeatherData
    }
}
