import { fetchNews } from "../services/newsService.js";

export const getNews = async (req, res) => {
  try {
    const news = await fetchNews();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
};
