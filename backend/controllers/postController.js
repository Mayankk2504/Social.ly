import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary"
import { message } from "../utils/message.js";
import { Response } from "../utils/response.js"

export const createPost = async (req, res) => {
    try {

        //parsing body data
        const{ image, caption, location} = req.body;

        //Checking body data
        if(!caption){
            return Response(res, 400, false, message.missFieldsMessage);
        }

        //Check image
        if(!image){
            return Response(res, 400, false, message.imageMissingMessage);
        }

        const imageUpload = await cloudinary.v2.uploader.upload(image, {
            folder: 'posts'
        })

        //Create Post
        let post = await Post.Create({
            image: {
                public_id: imageUpload.public_id,
                url: imageUpload.url
            },
            caption,
            location
        })

        //Set owner details
        post.owner = req.user_id;
        await post.save();

        // Set post in user
        let user = await User.findById(req.user._id);
        user.posts.unshift(post._id);
        await user.save();

        //send response
        Response(res, 201, true, message.postCreatedMessage);
        
    } catch (error) {
        Response(res, 500, false, error.message);
    }
}