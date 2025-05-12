import ContinueWatching from "../schema/contnueWatching";
import { Request, Response } from "express";

interface ContinueWatchingData {
    userId: string;
    AnimeId: string;
    episodeId: string;
    title: string;
    image: string;
}

export const addContinueWatching = async (req: Request, res: Response):Promise <void> => {
    const userId = req.user.id;
    const { AnimeId, episodeId, title, image }: ContinueWatchingData = req.body;

    try {
        const checkExist = await ContinueWatching.findOne({ userId, AnimeId, episodeId });
        if (checkExist) {
            res.status(400).json({ message: "Continue watching already exists" });
            return;
        }
        const checkExist2 = await ContinueWatching.findOne({ userId, AnimeId });
        if (checkExist2) {
            await ContinueWatching.findOneAndUpdate(
                { userId, AnimeId },
                { episodeId, title, image },
                { new: true }
            );
            res.status(200).json({ message: "Continue watching updated successfully" });
            return;
        }else {
             await ContinueWatching.create({
                userId,
                AnimeId,
                episodeId,
                title,
                image
            });

            res.status(201).json({ message: "Continue watching added successfully" });
            return;

        }
    }catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getContinueWatching = async (req: Request, res: Response):Promise <void> => {
    const userId = req.user.id;

    try {
        const continueWatching = await ContinueWatching.find({ userId });
        res.status(200).json(continueWatching);
    } catch (error) {
        console.error("Error fetching continue watching:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteContinueWatching = async (req: Request, res: Response):Promise <void> => {
    const userId = req.user.id;
    const AnimeId = req.params.id;
    try {

        if (!AnimeId) {
            res.status(400).json({ message: "Anime ID is required" });
            return;
        }

        await ContinueWatching.findOneAndDelete({ userId, AnimeId });
        res.status(200).json({ message: "Continue watching deleted successfully" });
    } catch (error) {   
        console.error("Error deleting continue watching:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}