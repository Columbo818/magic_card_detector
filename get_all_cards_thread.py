import pickle
from mtgsdk import Card
from mtgsdk import Set
from mtgsdk import Type
from mtgsdk import Supertype
from mtgsdk import Subtype
from mtgsdk import Changelog
import magic_card_detector as mcg
import time

card_detector = mcg.MagicCardDetector('/results')
card_detector.read_and_adjust_reference_images_from_url('cards.json')

hlist = []
time.sleep(5)
while not all(t.done() for t in card_detector.threads):
    time.sleep(1)

for image in card_detector.reference_images:
    image.original = None
    image.clahe = None
    image.adjusted = None
    #print(image.name)
    hlist.append(image)

with open('official_all.dat', 'wb') as f:
    pickle.dump(hlist, f)
