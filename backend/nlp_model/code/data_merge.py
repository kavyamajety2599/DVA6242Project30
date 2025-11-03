import pandas as pd
import sys
import csv
import random
from tqdm import tqdm

non_terminated_dataset = pd.read_csv(sys.argv[1])

terminated_dataset = pd.read_csv(sys.argv[2])

non_terminated_abstracts = non_terminated_dataset["abstracttext"]
terminated_abstracts = terminated_dataset["abstracttext"]

non_terminated_labeled_dataset = []

# 0 is for "accepted"
for a in tqdm(non_terminated_abstracts):
    row = [0, a]
    non_terminated_labeled_dataset.append(row)

terminated_labeled_dataset = []

for a in tqdm(terminated_abstracts):
    row = [1, a]
    terminated_labeled_dataset.append(row)

total_dataset = non_terminated_labeled_dataset + terminated_labeled_dataset

random.seed(42)
random.shuffle(total_dataset)

header = ["labels", "abstracttext"]   

# Create DataFrame
df = pd.DataFrame(total_dataset, columns=header)

df.to_csv(sys.argv[3], index=False)

