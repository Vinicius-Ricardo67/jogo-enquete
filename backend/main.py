import json
from fastapi import FastAPI, HTTPException
import socketio
import os
print(os.getcwd())
from fastapi.middleware.cors import CORSMiddleware

# Configuração base
app = FastAPI()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app_sio = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ENQUETES_DB = "enquetes.json"
USUARIOS_DB = "usuarios.json"


# Funções auxiliares

def load_db(filename):
    """Carrega o banco de dados(JSON)"""
    if not os.path.exists(filename):
        if "enquete" in filename or "enquetes" in filename:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump({"enquetes": []}, f, ensure_ascii=False, indent=4)
        else:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump({"usuarios": []}, f, ensure_ascii=False, indent=4)

    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(filename, data):
    """Salva o banco de dados (JSON)"""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# Rotas de Usuário

@app.post("/entrar")
def entrar(usuario: dict):
    """Faz login verificando o nome e a senha"""
    nome = usuario.get("nome")
    senha = usuario.get("senha")

    if not nome or not senha:
        raise HTTPException(status_code=400, detail="Nome e senha são obrigatórios!")

    db = load_db(USUARIOS_DB)

    for u in db["usuarios"]:
        if u["nome"] == nome and u["senha"] == senha:
            return {"msg": "Login realizado com sucesso!", "usuario": u}
        
    raise HTTPException(status_code=401, detail="Nome ou senha incorreto!")

@app.get("/")
def home():
    return {"msg": "Backend rodando com sucesso!"}

@app.post("/cadastro")
def cadastro(usuario: dict):
    """Cadastro do nome, email e senha"""
    nome = usuario.get("nome")
    email = usuario.get("email")
    senha = usuario.get("senha")

    if not nome or not email or not senha:
        raise HTTPException(status_code=400, detail="Nome, email e senha são obrigatórios!")

    db = load_db(USUARIOS_DB)

    for u in db["usuarios"]:
        if u["nome"] == nome or u["email"] == email:
            raise HTTPException(status_code=400, detail="Nome ou Email já estão em uso!")

    novo_usuario = {"nome": nome, "email": email, "senha": senha}
    db["usuarios"].append(novo_usuario)
    save_db(USUARIOS_DB, db)

    return {"msg": "Usuário cadastrado com sucesso!", "usuario": novo_usuario}


@app.post("/login")
def login(usuario: dict):
    """Login com nome e senha"""
    nome = usuario.get("nome")
    senha = usuario.get("senha")

    if not nome or not senha:
        raise HTTPException(status_code=400, detail="Nome e senha são obrigatórios!")

    db = load_db(USUARIOS_DB)

    for u in db["usuarios"]:
        if u["nome"] == nome and u["senha"] == senha:
            return {"msg": "Login realizado com sucesso!", "usuario": u}

    raise HTTPException(status_code=401, detail="Nome ou senha incorretos!")

@app.post("/logout")
def logout(usuario: dict):
    nome = usuario.get("nome")
    db = load_db(USUARIOS_DB)

    if nome not in db["usuarios"]:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    db["usuarios"].remove(nome)
    save_db(USUARIOS_DB, db)
    return {"msg": f"{nome} saiu com sucesso!"}

@app.get("/usuarios")
def listar_usuarios():
    db = load_db(USUARIOS_DB)
    return db["usuarios"]

# Rotas das Enquetes

@app.post("/enquetes")
def criar_enquete(enquete: dict):
    pergunta = enquete.get("pergunta")
    opcoes = enquete.get("opcoes")

    if not pergunta or not opcoes:
        raise HTTPException(status_code=400, detail="Pergunta e opções são obrigatórias.")

    db = load_db(ENQUETES_DB)
    nova_enquete = {
        "id": len(db["enquetes"]) + 1,
        "pergunta": pergunta,
        "opcoes": opcoes,
        "votos": {op: 0 for op in opcoes}
    }

    db["enquetes"].append(nova_enquete)
    save_db(ENQUETES_DB, db)
    return nova_enquete

@app.get("/enquetes")
def listar_enquetes():
    db = load_db(ENQUETES_DB)
    return db["enquetes"]

@app.get("/enquetes/{enquete_id}")
def obter_enquete(enquete_id: int):
    db = load_db(ENQUETES_DB)
    for e in db["enquetes"]:
        if e["id"] == enquete_id:
            total = sum(e["votos"].values())
            porcentagens = {
                op: round((v / total) * 100, 1) if total > 0 else 0
                for op, v in e["votos"].items()
            }
            e["porcentagens"] = porcentagens
            e["total_votos"] = total
            return e

    raise HTTPException(status_code=404, detail="Enquete não encontrada.")

@app.post("/votar/{enquete_id}")
def votar(enquete_id: int, voto: dict):
    opcao = voto.get("opcao")
    usuario = voto.get("usuario")

    if not opcao or not usuario:
        raise HTTPException(status_code=400, detail="Opção e usuário são obrigatórios.")

    db_usuarios = load_db(USUARIOS_DB)
    if usuario not in db_usuarios["usuarios"]:
        raise HTTPException(status_code=403, detail="Usuário não está logado.")

    db = load_db(ENQUETES_DB)
    for e in db["enquetes"]:
        if e["id"] == enquete_id:
            if opcao not in e["opcoes"]:
                raise HTTPException(status_code=400, detail="Opção inválida.")
            e["votos"][opcao] += 1
            save_db(ENQUETES_DB, db)

            total = sum(e["votos"].values())
            porcentagens = {
                op: round((v / total) * 100, 1) if total > 0 else 0
                for op, v in e["votos"].items()
            }
            e["porcentagens"] = porcentagens
            e["total_votos"] = total

            sio.start_background_task(notificar_votacao, e)
            return {"msg": "Voto computado com sucesso!", "resultado": e}

    raise HTTPException(status_code=404, detail="Enquete não encontrada.")

# Eventos Socket.IO

@sio.event
async def connect(sid, environ):
    print(f"Cliente conectado: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Cliente desconectado: {sid}")

async def notificar_votacao(enquete):
    await sio.emit("atualizacao_votos", enquete)
