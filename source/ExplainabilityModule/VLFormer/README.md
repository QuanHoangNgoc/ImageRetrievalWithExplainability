# VLFormer: Visual-Linguistic Transformer for Referring Image Segmentation
## Abstract
The referring image segmentation task aims to segment a referred object from an image using a natural language expression. The query expression in referring image segmentation typically describes the relationship between the target object and others. Therefore, several objects may appear in the expression, and the model must carefully understand the language expression and select the correct object that the expression refers to. In this work, we introduce a unified and simple query-based framework named VLFormer. Concretely, we use a small set of object queries to represent candidate objects and design a mechanism to generate the fine-grained object queries by utilizing language and multi-scale vision information. More specifically, we propose a Visual-Linguistic Transformer Block, which produces a richer representation of the objects by associating visual and linguistic features with the object queries effectively and simultaneously.
At the same time, we leverage the ability to extract linguistic features from CLIP, which has a great potential for compatibility with visual information.Without bells and whistles, our proposed method significantly outperforms the previous state-of-the-art methods by large margins on three referring image segmentation datasets: RefCOCO, RefCOCO+, and G-Ref.
## Update 
```update here```
## Demo
```demo here```
## Requirements
We test our work in the following environments, other versions may also be compatible:
- CUDA 11.1
- Python 3.8
- Pytorch 1.9.0

## Installation
Please refer to [installation.md](docs/installation.md) for installation

## Data preparation
Please refer to [data.md](docs/data.md) for data preparation.
## Training 
```
sh scripts/train.sh 
```
or 
```
python train_net_video.py --config-file <?> --num-gpus <?> OUTPUT_DIR <?>
```
In terms of resuming the previous training, then add the flag ```--resume``` 

## Evaluation
```
python train_net_video.py --config-file <?> --num-gpus <?> --eval-only OUTPUT_DIR <?>
```
