import logging

import torch
import clip

logger = logging.getLogger(__name__)

device = "cuda" if torch.cuda.is_available() else "cpu"
if device != "cuda": 
    logger.warning("CLIP not running on CUDA!")

model, preprocess = clip.load("ViT-L/14@336px")

logger.info("CLIP successfully loaded")

def encode_text(text):
    with torch.no_grad():
        text_tokenized = clip.tokenize(text).to(device)
        text_feature = model.encode_text(text_tokenized)
        text_feature = text_feature / text_feature.norm(dim=1, keepdim=True)
    return text_feature.cpu()

def encode_image(image):
    image = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        image_feature = model.encode_image(image)
        image_feature = image_feature / image_feature.norm(dim=1, keepdim=True)
    return image_feature.detach().cpu()

def encode_images(images):
    images = torch.stack([
        preprocess(image) for image in images
    ]).to(device)
    with torch.no_grad():
        image_feature = model.encode_image(images)
        image_feature = image_feature / image_feature.norm(dim=1, keepdim=True)
    return image_feature.detach().cpu()
