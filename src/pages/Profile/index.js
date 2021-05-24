import {useState, useContext} from  'react'
import './profile.css'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiSettings, FiUpload } from  'react-icons/fi'
import {AuthContext} from '../../contexts/auth'
import avatar from '../../assets/avatar.png'
import firebase from '../../services/firebaseConnection'

export default function Profile(){
    const {user, signOut, setUser, storageUser} = useContext(AuthContext);
    const [nome, setNome] = useState(user && user.nome)
    const [email, setEmail] = useState(user && user.email)
    const [avatarUrl,setAvatarUrl] = useState(user && user.avatarUrl)
    const [imageAvatar, setImageAvatar] = useState('')

function handleFile(e){
if(e.target.files[0]) {
    const image = e.target.files[0]
    if(image.type === 'image/jpeg' || image.type === 'image/png'){
setImageAvatar(image);
setAvatarUrl(URL.createObjectURL(e.target.files[0]))
    } else {
        alert('Envie uma imagem do tipo PNG ou JPEG')
        setImageAvatar(null);
        return null;
    }
}
}

async function HandleUpload(){
    const currentUID = user.uid;

    const uploadTask = await firebase.storage()
    .ref(`images/${currentUID}/${imageAvatar.name}`)
    .put(imageAvatar)
    .then(async ()=>{
        console.log('FOTO ENVIADA COM SUCESSO')
        await firebase.storage().ref(`images/${currentUID}`)
        .child(imageAvatar.name).getDownloadURL()
        .then(async (url)=>{
        let urlFoto = url

        await firebase.firestore().collection('users')
        .doc(user.uid)
        .update({
            avatarUrl: urlFoto,
            nome: nome
        })
        .then(()=>{
            let data = {
                ...user,
                avatarUrl: urlFoto,
                nome: nome
            }
            setUser(data)
            storageUser(data)
        })

        })
    })

}


async function HandleSave(e){
    e.preventDefault()
    if(imageAvatar === null && nome!==''){
await firebase.firestore.collection('users')
.doc(user.uid)
.update({
    nome: nome
})
.then(()=>{
let data = {
    ...user,
    nome: nome
}
setUser(data);
storageUser(data)
})
    } else if(nome !== '' && imageAvatar!== null) {
HandleUpload()
    }
}





    return(
        <div>
            <Header/>
            <div className="content">
                <Title name="My profile">
                <FiSettings size={25}/>
                </Title>


                <div className="container">
                    <form className="form-profile" onSubmit={HandleSave}>
                        <label className="label-avatar">
                            <span>
                                <FiUpload color="#FFF" size={25}/>
                            </span>
                            <input type="file" accept="image/*" onChange={handleFile}/> <br/>
                            {avatarUrl === null ? 
                            <img src={avatar} width="250" height="250" alt="User profile's picture"/> 
                         :    <img src={avatarUrl} width="250" height="250" alt="User profile's picture"/> }
                         
                        </label>
                        <label>Nome:</label>
                        <input type="text" value={nome} onChange={(e)=> setNome(e.target.value)}/>
                        <label>Email:</label>
                        <input type="text" value={email} disabled={true}/>

                        <button type="submit">Salvar</button>
                    </form>
                </div>
                <div className="container">
                    <button className="logout-btn" onClick={()=> signOut()}>
                        Sair
                    </button>

                </div>
            </div>
            
        </div>
    )
}