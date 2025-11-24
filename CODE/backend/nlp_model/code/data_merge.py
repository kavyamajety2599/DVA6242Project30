import pandas as pd
import sys
import csv
import random
from tqdm import tqdm

non_terminated_dataset = pd.read_csv(sys.argv[1])

terminated_dataset = pd.read_csv(sys.argv[2])

non_terminated_abstracts = non_terminated_dataset["abstract"]
terminated_abstracts = terminated_dataset["abstract"]

non_terminated_labeled_dataset = []

# 0 is for "accepted"
for a in tqdm(non_terminated_abstracts):
    row = [0, a]
    non_terminated_labeled_dataset.append(row)

terminated_labeled_dataset = []

for a in tqdm(terminated_abstracts):
    row = [1, a]
    terminated_labeled_dataset.append(row)

random.seed(42)
random.shuffle(non_terminated_labeled_dataset)
random.shuffle(terminated_labeled_dataset)

total_dataset = non_terminated_labeled_dataset[:6000] + terminated_labeled_dataset

# total_dataset = non_terminated_labeled_dataset + terminated_labeled_dataset

random.shuffle(total_dataset)

# print(terminated_labeled_dataset)

header = ["labels", "abstracttext"]   


# Create DataFrame
df = pd.DataFrame(total_dataset, columns=header)
# df2 = pd.DataFrame(terminated_labeled_dataset, columns=header)

df.to_csv(sys.argv[3], index=False)
# df2.to_csv(sys.argv[4], index=False)

