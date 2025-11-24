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
from sklearn.pipeline import Pipeline
from imblearn.pipeline import Pipeline as imbl_pipeline
from sklearn.metrics import classification_report
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from imblearn.over_sampling import RandomOverSampler
from imblearn.over_sampling import SMOTE
from imblearn.ensemble import BalancedRandomForestClassifier
from imblearn.combine import SMOTETomek
from imblearn.combine import SMOTEENN
from sklearn.preprocessing import StandardScaler

from scipy.sparse import dok_matrix
from scipy.sparse import vstack as sci_vstack

data = pd.read_csv(sys.argv[1]) # input data
# data2 = pd.read_csv(sys.argv[2])

# making sure there are no nan values
data = data.dropna()
data = data.reset_index(drop=True)

# data2 = data2.dropna()
# data2 = data2.reset_index(drop=True)

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

# ******** cleaned data for most experiments ***********
cleaned_data = further_clean_data(data)
# cleaned_non_term_data = further_clean_data(data)
# cleaned_term_data = further_clean_data(data2)

# ******** setting up the model ***********

# seperating the ml dataaset into train and testing sets
X = cleaned_data["abstracttext"]
y = cleaned_data["labels"]

# ********* two datasets stuff ************

# tfidf = TfidfVectorizer(stop_words='english')

# X_0 = cleaned_non_term_data["abstracttext"]
# y_0 = cleaned_non_term_data["labels"]

# X_1 = cleaned_term_data['abstracttext']
# y_1 = cleaned_term_data['labels']

# X_all_text = pd.concat([X_0, X_1])
# tfidf.fit(X_all_text)

# X0_tfidf = tfidf.transform(X_0)
# X1_tfidf = tfidf.transform(X_1)

# svd_0 = TruncatedSVD(n_components=1000, random_state=42)
# X0_svd = svd_0.fit_transform(X0_tfidf)

# svd_1 = TruncatedSVD(n_components=1000, random_state=42)
# X1_svd = svd_1.fit_transform(X1_tfidf)

# scaler_0 = StandardScaler(with_mean=False)  # for sparse matrices
# X0_scaled = scaler_0.fit_transform(X0_tfidf)

# scaler_1 = StandardScaler(with_mean=False)
# X1_scaled = scaler_1.fit_transform(X1_tfidf)

# X_combined_scaled = sci_vstack([X0_svd, X1_svd])
# y_combined = np.concatenate([y_0, y_1])

# oversample = RandomOverSampler(sampling_strategy='minority')
# X_over, y_over = oversample.fit_resample(X, y)

# ************ main model *************************

X_train, X_test, y_train, y_test = train_test_split(
   X, y, test_size=0.2, random_state=42
)

# smote = SMOTE(sampling_strategy='auto', random_state=42)
# X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

# *********** kfold experiment ******************

# k_fold_params = {
#     'tfidf__max_features': [20000, 30000],
#     'tfidf__ngram_range': [(1,1), (1,2)],
#     'tfidf__min_df': [5, 10],
#     'tfidf__max_df': [0.8, 0.9],
#     'svd__n_components': [100, 150, 200],
#     'svd__n_iter': [5, 10],
#     'clf__C': [0.5, 1, 5],
#     'clf__solver': ['ibfgs']
# }

# cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# ********** manually finding n_components for > 0.95 variance *************

# # TF-IDF and latant semantic analysis
# oversampler = RandomOverSampler(sampling_strategy='minority')

# X_tfidf = tfidf.fit_transform(X_train)
# x_over, y_over = oversampler.fit_resample(X_tfidf, y_train)
# svd = TruncatedSVD(n_components=min(5000, X_tfidf.shape[1]), random_state=42)
# X_svd = svd.fit_transform(x_over)

# explained_variance = np.cumsum(svd.explained_variance_ratio_)
# # Find the number of components that reach 95%
# n_components_95 = np.searchsorted(explained_variance, 0.95) + 1

# print(n_components_95)

# ********* main model pipeline *************************

tf_idf_model = imbl_pipeline([
    ("tfidf", TfidfVectorizer(stop_words='english')),
    # ("smote", SMOTE(sampling_strategy='auto', random_state=42)),
    ("oversample", RandomOverSampler(sampling_strategy='minority')),
    # ("smotetomk", SMOTETomek(sampling_strategy="auto")),
    # ("smotet", SMOTEENN(sampling_strategy="auto")), # this is too agressive
    ("svd", TruncatedSVD(n_components=5000, random_state=42)),
    # ("brdf", BalancedRandomForestClassifier(random_state=42))
    # ("rdf", RandomForestClassifier(random_state=42, max_depth=20))
    ("clf", LogisticRegression(max_iter=1000, class_weight='balanced'))
], verbose=True)

# grid = GridSearchCV(
#     estimator=tf_idf_model,
#     param_grid=k_fold_params,
#     scoring='f1',
#     cv=cv,
#     n_jobs=-1,
#     verbose=2,
# )

# tf_idf_model.fit(X_train, y_train)
tf_idf_model.fit(X_train, y_train)

y_pred = tf_idf_model.predict(X_test)

classifier_classes = tf_idf_model.classes_

y_probs = tf_idf_model.predict_proba(X_test)[:, 1]

y_prob = tf_idf_model.predict_proba(X_test)

treshold = 0.5

y_pred_custom = (y_probs >= treshold).astype(int)

# model_dictionary = build_dictionary(X_train)

# model_features = get_features(X_train, model_dictionary)

# train_features = get_features(X_test, model_dictionary)

# y_pred = logistic_classifier.predict(train_features)

# y_prob = logistic_classifier.predict_proba(train_features) # numpy array

# classifier_classes = logistic_classifier.classes_

y_prob_df = pd.DataFrame(y_prob, columns=classifier_classes)

header = ["predicted_label"]

# y_true_df = y_test.to_frame()

y_true_df = pd.DataFrame(y_test, columns=["labels"])

final_df = pd.DataFrame(y_pred_custom, columns=header)

# output csvs
final_df.to_csv(sys.argv[2], index=False)
y_true_df.to_csv(sys.argv[3], index=False)
y_prob_df.to_csv(sys.argv[4], index=False)

# ************* code to get json files - comment out before running model ********

# input_y_pred_path = sys.argv[2]
# input_y_true_path = sys.argv[3]
# input_y_prob_path = sys.argv[4]

# input_y_pred_df = pd.read_csv(input_y_pred_path)
# input_y_true_df = pd.read_csv(input_y_true_path)
# input_y_prob_df = pd.read_csv(input_y_prob_path)

# input_y_pred_df.to_json(sys.argv[5], orient='records', indent=4)
# input_y_true_df.to_json(sys.argv[6], orient='records', indent=4)
# input_y_prob_df.to_json(sys.argv[7], orient='records', indent=4)