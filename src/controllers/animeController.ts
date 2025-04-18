import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Comment {
    comment: string;
    userId: number;
    animeId: number;
}


export const createComment = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { comment, animeId } = req.body as Comment;
    console.log(req.body);
    try {
        const Comment = await prisma.comment.create({
            data: {
                content:comment,
                userId,
                AnimeId:animeId
            }
        });
        res.status(201).json({ message: 'Comment created', Comment });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
        
    }
};


export const getComments = async (req: Request, res: Response): Promise<void> => {
    const animeId = Number(req.params.animeId);
    try {
        const comments = await prisma.comment.findMany({
            where: {
                AnimeId: animeId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        profile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ comments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user.id;
    const commentId = Number(req.params.commentId);

    try {
        const comment = await prisma.comment.findFirst({
            where:{
                id:commentId
            }
        });
        if(!comment){
            res.status(404).json({message:'Comment not found'});
            return;
        }
        if(comment.userId !== userId){
            res.status(401).json({message:'Unauthorized'});
            return;
        }
        await prisma.comment.delete({
            where:{
                id:commentId
            }
        });
        res.status(200).json({message:'Comment deleted'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
        
    }

};