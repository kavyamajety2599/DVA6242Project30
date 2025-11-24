import nltk
import re
import pandas as pd
import numpy as np
import sys
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from imblearn.pipeline import Pipeline
from sklearn.metrics import classification_report
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from scipy.sparse import dok_matrix
from imblearn.over_sampling import RandomOverSampler

data = pd.read_csv(sys.argv[1])
data = data.dropna()
data = data.reset_index(drop=True)

nltk.download('punkt_tab')

def further_clean_data(data):
    cleaned_abstracts = []

    for i in range(len(data)):
        cleaned_sentences = []
        abstract = data.loc[i, 'abstracttext']
        sentences = nltk.sent_tokenize(abstract)
        
        for sentence in sentences:
            sentence = sentence.lower()
            sentence = re.sub(r'\W', ' ', sentence)
            sentence = re.sub(r'\s+', ' ', sentence)
            cleaned_sentences.append(sentence)

        clean_abstract = " ".join(cleaned_sentences)
        cleaned_abstracts.append(clean_abstract)
    
    data['abstracttext'] = cleaned_abstracts
          
    return data
    
cleaned_data = further_clean_data(data)

X = cleaned_data["abstracttext"]
y = cleaned_data["labels"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

TF_IDF = TfidfVectorizer(stop_words='english')
svd = TruncatedSVD(n_components=1800, random_state=42)
oversamp = RandomOverSampler(sampling_strategy='minority', random_state=42)
LogReg = LogisticRegression(max_iter=1200, class_weight='balanced')
tf_idf_model = Pipeline([
    ("tfidf", TF_IDF),
    ("svd", svd),
    ("oversample", oversamp),
    ("clf", LogReg)
], verbose=True)

tf_idf_model.fit(X_train, y_train)
y_pred = tf_idf_model.predict(X_test)
classifier_classes = tf_idf_model.classes_
y_probs = tf_idf_model.predict_proba(X_test)[:, 1]
y_prob = tf_idf_model.predict_proba(X_test)

y_prob_df = pd.DataFrame(y_prob, columns=classifier_classes)

header = ["predicted_label"]

y_true_df = y_test.to_frame()

final_df = pd.DataFrame(y_pred, columns=header)

# output csvs
final_df.to_csv('y_pred.csv', index=False)
y_true_df.to_csv('y_true.csv', index=False)
y_prob_df.to_csv('y_prob.csv', index=False)

X_tfidf = TF_IDF.transform(X)

def swap_tfidf_features(X_original, vectorizer, swap_dict):
    # convert to LIL for efficient modification
    X_mod = X_original.tolil()

    for orig, new in swap_dict.items():
        if orig in vectorizer.vocabulary_ and new in vectorizer.vocabulary_:
            idx_orig = vectorizer.vocabulary_[orig]
            idx_new = vectorizer.vocabulary_[new]

            weight = X_original[0, idx_orig]

            # remove original word
            X_mod[0, idx_orig] = 0

            # add to new word
            X_mod[0, idx_new] = weight

    return X_mod.tocsr()

swap_dict = {'man': 'woman'}

bias_effects = {}

for i, abstract in enumerate(X):
    X_orig_vec = X_tfidf[i]
    X_mod_vec = swap_tfidf_features(X_orig_vec, TF_IDF, swap_dict)
    
    # Pass through SVD
    X_orig_svd = svd.transform(X_orig_vec)
    X_mod_svd = svd.transform(X_mod_vec)
    
    # Get predicted probabilities
    proba_orig = LogReg.predict_proba(X_orig_svd)[0, 1]
    proba_mod = LogReg.predict_proba(X_mod_svd)[0, 1]
    
    delta = proba_mod - proba_orig

    if i % 100 == 0:
        print(i)
    
    if delta != 0:  # only keep non-zero deltas
        bias_effects[i] = {
            "abstract": abstract,
            "proba_orig": proba_orig,
            "proba_mod": proba_mod,
            "delta": delta
        }

    bias_effects_df = pd.DataFrame(bias_effects)

    bias_effects_df.to_csv(sys.argv[2])