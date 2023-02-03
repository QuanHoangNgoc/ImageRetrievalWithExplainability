import torch 
import numpy as np 

import logging 

logger = logging.getLogger(__name__)

FEAT_DIM = 768 

def get_centroid(x):
    if x is None:
        return None
    if isinstance(x, list):
        return np.stack(x, dim = 0).mean(0)
    else:
    # elif isinstance(x, np.) and x.ndim == 2:
        return np.mean(x, 0)
    

def rocchio_relevance_feedback(query = None, positive = None, negative = None, alpha = 1, beta = 0.8, gamma = 0.1):
    """
        Rocchio algorithm for relevance feedback as follows:
            newQuery = alpha * query + beta * centroid(positive) - gamma * centroid(negative)
        Args:
            query:
            positive:
            negative:
            alpha, beta, gamma: 
        Returns: 
            newQuery: 
    """
    logger.warning("Rocchio relevance feedback")
    
    newQuery = query * alpha 
    if positive is not None: newQuery += beta * get_centroid(positive)
    if negative is not None: newQuery -= gamma * get_centroid(negative) 
    return newQuery

def get_image_feature(image_name):
    return torch.rand(FEAT_DIM).cuda()

def pseudo_relevance_feedback(query, search_results, client, top_k = 10, num_update = 1):
    """
        Pseudo Relevance Feedback:
            Assume top_k results is relevant, and then update the query by the Rocchio algorithm
    """

    logger.warning("Getting image feature")
    positive = np.stack(client.get_image_feature([image_name.split('.')[0] for image_name in search_results[:10]]), 0)
    
    query = rocchio_relevance_feedback(query, positive)
    if num_update > 1:
        for i in range(num_update - 1):
            # Update the search results 
            search_results = search_results
            positive = np.stack(client.get_image_feature([image_name.split('.')[0] for image_name in search_results[:10]]), 0)
            query = rocchio_relevance_feedback(query, positive)
    return query 

if __name__ == "__main__":
    query = torch.rand(FEAT_DIM).cuda() 
    search_results = torch.arange(2048)
    newQuery = pseudo_relevance_feedback(query, search_results) 
    from torch.nn import CosineSimilarity 
    cos = CosineSimilarity(dim = 0)
    print(newQuery.shape)
    print(cos(query, newQuery))
