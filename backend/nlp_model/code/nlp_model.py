import nltk
import re
import pandas as pd
import numpy as np
import sys
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from scipy.sparse import dok_matrix

data = pd.read_csv(sys.argv[1])

# making sure there are no nan values
data = data.dropna()
data = data.reset_index(drop=True)

nltk.download('punkt_tab') # required based on compiler output

#further cleaning data after combining datasets
def further_clean_data(data):
    cleaned_abstracts = []

    for i in range(len(data)):
        cleaned_sentences = []
        abstract = data.loc[i, 'abstracttext']
        sentences = nltk.sent_tokenize(abstract)
        
        for sentence in sentences:
            sentence = sentence.lower() # changing everything to lower case
            sentence = re.sub(r'\W', ' ', sentence) # removing characters that are not words
            sentence = re.sub(r'\s+', ' ', sentence) # removing trailing spaces
            cleaned_sentences.append(sentence)

        clean_abstract = " ".join(cleaned_sentences)
        cleaned_abstracts.append(clean_abstract)
    
    data['abstracttext'] = cleaned_abstracts
          
    return data

def tokenize(datapoint):
    return nltk.word_tokenize(datapoint) # seperates text into individual words

def build_dictionary(cleaned_data) -> dict:
    unique_words = set() # only including unique words in the dictionary
    for abstract in cleaned_data:
        words = tokenize(abstract)
        for word in words:
            unique_words.add(word) # need to individually add words because of multiple abstracts
    
    model_dictionary = {word: i for i, word in enumerate(unique_words)}

    return model_dictionary

def get_features(cleaned_data, model_dictionary):
    feature_matrix = dok_matrix((len(cleaned_data), len(model_dictionary))) # this is a sparse matrix - prevents memory problems
    
    for i, abstract in enumerate(cleaned_data):
        words = tokenize(abstract)
        for word in words:
            if word in model_dictionary: # words not in dictionary will have no probability, so they are removed
                feature_matrix[i, model_dictionary[word]] += 1
    
    return feature_matrix 

cleaned_data = further_clean_data(data)

# setting up the model

# seperating the ml dataaset into train and testing sets
X = cleaned_data["abstracttext"]
y = cleaned_data["labels"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model_dictionary = build_dictionary(X_train)

model_features = get_features(X_train, model_dictionary)

logistic_classifier = LogisticRegression()
logistic_classifier.fit(model_features, y_train)

train_features = get_features(X_test, model_dictionary)

y_pred = logistic_classifier.predict(train_features)

y_prob = logistic_classifier.predict_proba(train_features) # numpy array

classifier_classes = logistic_classifier.classes_

y_prob_df = pd.DataFrame(y_prob, columns=classifier_classes)

header = ["predicted_label"]

y_true_df = y_test.to_frame()

final_df = pd.DataFrame(y_pred, columns=header)

final_df.to_csv(sys.argv[2], index=False)
y_true_df.to_csv(sys.argv[3], index=False)
y_prob_df.to_csv(sys.argv[4], index=False)

# input_y_pred_path = sys.argv[2]
# input_y_true_path = sys.argv[3]
# input_y_prob_path = sys.argv[4]

# input_y_pred_df = pd.read_csv(input_y_pred_path)
# input_y_true_df = pd.read_csv(input_y_true_path)
# input_y_prob_df = pd.read_csv(input_y_prob_path)

# input_y_pred_df.to_json(sys.argv[5], orient='records', indent=4)
# input_y_true_df.to_json(sys.argv[6], orient='records', indent=4)
# input_y_prob_df.to_json(sys.argv[7], orient='records', indent=4)