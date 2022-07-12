from flask import Flask , render_template

app=Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/snowflakes')
def snowflakes():
    return render_template('snowflakes.html')

@app.route('/island')
def island():
    return render_template('island.html')

@app.route('/pi_game')
def pi_game():
    return render_template('pi_game.html')

@app.route('/chess')
def chess():
    return render_template('chess.html')

if __name__=='__main__':
    app.run(debug=True)