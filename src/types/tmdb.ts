// TMDB API Type Definitions

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  media_type?: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  media_type?: string;
}

export type TMDBMediaItem = (TMDBMovie & { media_type: "movie" }) | (TMDBTVShow & { media_type: "tv" });

export interface TMDBMovieDetail extends TMDBMovie {
  media_type: "movie";
  runtime: number;
  genres: TMDBGenre[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  production_companies: TMDBProductionCompany[];
  credits?: TMDBCredits;
  videos?: TMDBVideos;
  similar?: TMDBMovieList;
  recommendations?: TMDBMovieList;
}

export interface TMDBTVDetail extends TMDBTVShow {
  media_type: "tv";
  number_of_seasons: number;
  number_of_episodes: number;
  genres: TMDBGenre[];
  tagline: string;
  status: string;
  created_by: TMDBCreator[];
  seasons: TMDBSeason[];
  credits?: TMDBCredits;
  videos?: TMDBVideos;
  similar?: TMDBTVList;
  recommendations?: TMDBTVList;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBCreator {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  overview: string;
  poster_path: string | null;
  air_date: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string;
  runtime: number;
  vote_average: number;
}

export interface TMDBSeasonDetail {
  id: number;
  name: string;
  season_number: number;
  episodes: TMDBEpisode[];
  overview: string;
  poster_path: string | null;
  air_date: string;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  cast: TMDBCast[];
  crew: TMDBCrew[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBVideos {
  results: TMDBVideo[];
}

export interface TMDBMovieList {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TMDBTVList {
  results: TMDBTVShow[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface TMDBTrendingList {
  page: number;
  results: TMDBMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenreList {
  genres: TMDBGenre[];
}
