from escpos.printer import Usb, Dummy

from flask import Flask, request
from flask_restful import Resource, Api
from json import dumps
from flask_jsonpify import jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)
api = Api(app)

p = Usb(0x04b8, 0x0e15, 0)

class Print(Resource):
    def post(self):
        content = request.json
        if content == None:
            return {'status': 'error', 'error': 'No Content'}
        
        p.set(width=4, height=4)
        p.text(str(content['ticketCount'])+"\n")
        p.set(width=2, height=2)
        p.text(content['doelgroepnummer']+"\n")
        p.text(content['naam'] + " " + content['voornaam']+"\n")
        if content['typeVoeding'] != "gewoon": 
            p.set(align='right',width=2, height=2)
        p.text(content['typeVoeding']+"\n")
        if content['typeVoeding'] != "gewoon": 
            p.set(align='left',width=2, height=2)
        p.text(content['code']+"\n")
        p.text("Volwassenen: " + str(content['volwassenen'])+"\n")
        p.text("Kinderen: " + str(content['kinderen'])+"\n")
        if content['needsVerjaardag']: 
            p.text("\nVERJAARDAG\n")
        p.cut()
        return {'status': 'ok'}

        
api.add_resource(Print, '/print')

if __name__ == '__main__':
     app.run(port='8080')
     