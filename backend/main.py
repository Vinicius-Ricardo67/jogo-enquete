import json
from fastapi import FastAPI, HTTPException
import socketio
import os
from fastapi.middleware.cors import CORSMiddleware


# Configuração inicial

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app_sio = socketio.ASGIApp(sio, app)

ENQUETES_DB = "enquetes.json"
USUARIOS_DB = "usuarios.json"

# Funções auxiliares

def load_db(filename):
    """Carrega o banco de dados(JSON)"""
    if not os.path.exists(filename):
        if "enquete" in filename or "enquetes" in filename:
            with open(filename, "w") as f:
                json.dump({"enquetes": []}, f)
        else:
            with open(filename, "w") as f:
                json.dump({"usuarios": []}, f)
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(filename, data):
    """Salva o banco de dados (JSON)"""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# Rotas de Usuário

@app.get("/")
def home():
    return {"msg": "dasdashjdjasjhdaskj"}

@app.post("/login")
def login(usuario: dict):
    """Login simples (apenas nome)"""
    nome = usuario.get("nome")
    if not nome:
        raise HTTPException(status_code=400, detail="Nome é obrigatório.")

    db = load_db(USUARIOS_DB)
    if nome in db["usuarios"]:
        raise HTTPException(status_code=400, detail="Esse nome já está em uso.")

    db["usuarios"].append(nome)
    save_db(USUARIOS_DB, db)
    return {"msg": "Login realizado com sucesso!", "usuario": nome}

@app.post("/logout")
def logout(usuario: dict):
    """Logout (remove o usuário do JSON)"""
    nome = usuario.get("nome")
    db = load_db(USUARIOS_DB)

    if nome not in db["usuarios"]:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    db["usuarios"].remove(nome)
    save_db(USUARIOS_DB, db)
    return {"msg": f"{nome} saiu com sucesso!"}

@app.get("/usuarios")
def listar_usuarios():
    """Lista todos os usuários conectados"""
    db = load_db(USUARIOS_DB)
    return db["usuarios"]

# Rotas das enquetes

@app.post("/enquetes")
def criar_enquete(enquete: dict):
    """Cria uma nova enquete"""
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
    """Lista todas as enquetes"""
    db = load_db(ENQUETES_DB)
    return db["enquetes"]

@app.get("/enquetes/{enquetes_id}")
def obter_enquete(enquete_id: int):
    """Obtém uma enquete específica com porcentagens"""
    db = load_db(ENQUETES_DB)
    for e in db["enquetes"]:
        if e["id"] == enquete_id:
            total = sum(e["votos"].value())
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
    """Vota em uma opção"""
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

@sio.event
async def connect(sid, environ):
    print(f"Cliente conectado: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Cliente deconectado: {sid}")

async def notificar_votacao(enquete):
    """Envia atualização da enquete em tempo real"""
    await sio.emit("atualizacao_votos", enquete)
