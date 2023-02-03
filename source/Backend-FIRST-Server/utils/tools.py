import itertools

def map_batch(a, f, batch_size):
    n = len(a)
    result = []
    for i in range(0, n, batch_size):
        batch = a[i:i+batch_size]
        result.extend(f(batch))
    return result

def pairwise(iterable):
    a, b = itertools.tee(iterable)
    next(b, None)
    return zip(a, b)