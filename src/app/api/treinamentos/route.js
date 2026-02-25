import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // Importando a conexão que você está criando
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where 
} from "firebase/firestore";

// Referência para a coleção no Firebase
const colecaoRef = collection(db, "treinamentos");

/* ======================================================
   LISTAR TREINAMENTOS (GET)
====================================================== */
export async function GET() {
  try {
    const snapshot = await getDocs(colecaoRef);
    // Mapeia os documentos do Firebase para o formato do seu projeto
    const dados = snapshot.docs.map(documento => ({
      ...documento.data()
    }));
    
    return NextResponse.json(dados);
  } catch (error) {
    console.error("Erro ao buscar no Firebase:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}

/* ======================================================
   CRIAR OU ATUALIZAR (POST)
====================================================== */
export async function POST(request) {
  try {
    const corpo = await request.json();
    const { id } = corpo;

    // Busca se já existe um documento com esse campo "id"
    const q = query(colecaoRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // ATUALIZAR: Se encontrou, pega a referência interna do Firebase e atualiza
      const firestoreId = querySnapshot.docs[0].id;
      const docRef = doc(db, "treinamentos", firestoreId);
      await updateDoc(docRef, corpo);
    } else {
      // CRIAR: Se não existe, adiciona um novo documento
      await addDoc(colecaoRef, corpo);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

/* ======================================================
   REMOVER (DELETE)
====================================================== */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    // Localiza o documento pelo campo "id" customizado
    const q = query(colecaoRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // Remove o documento encontrado
    const firestoreId = querySnapshot.docs[0].id;
    await deleteDoc(doc(db, "treinamentos", firestoreId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar no Firebase:", error);
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });
  }
}