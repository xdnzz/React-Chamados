import Header from '../../components/Header'
import Title from '../../components/Title'
import {FiPlusCircle} from 'react-icons/fi'
import './new.css'
import { useState, useEffect, useContext} from 'react' 
import firebase from '../../services/firebaseConnection'
import {useHistory, useParams} from 'react-router-dom'
import {AuthContext} from '../../contexts/auth'
import { toast } from 'react-toastify'
export default function New(){

const {id} = useParams();
const history = useHistory()
const [loadCustomers, setLoadCustomers] = useState(true)
const [customers, setCustomers] = useState([])   
const [customerSelected, setCustomersSelected] = useState(0)

const [assunto, setAssunto] = useState('Suporte')
const [status, setStatus] = useState('Aberto')
const [complemento, setComplemento] = useState('')
const {user} = useContext(AuthContext)

const [idCustomer, setIdCustomer] = useState(false)

useEffect(()=>{
async function loadCustomers(){
await firebase.firestore().collection('customers')
.get()
.then((snapshot)=>{

let lista = [];
snapshot.foreach((doc)=>{
    lista.push({
        id:doc.id,
        nomeFantasia: doc.data().nomeFantasia,

    })
})

if(lista.lenght === 0 ) {
    console.log('nenhuma empresa encontrada')
    setCustomers([ {id: '1', nomeFantasia: 'FREELA'} ])
    setLoadCustomers(false)
    return;
}

setCustomers(lista)
setLoadCustomers(false)

if(id){
    loadId(lista)
}

})
.catch((error)=>{
    console.log(error);
    setLoadCustomers(false)
    setCustomers([ {id: '1', nomeFantasia: ''} ])
})
}

loadCustomers();
}, [])



async function loadId(lista){
await firebase.firestore().collection('chamados').doc(id)
.get()
.then((snapshot)=>{
setAssunto(snapshot.data().assunto);
setStatus(snapshot.data().status);
setComplemento(snapshot.data().complemento)

let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
setCustomersSelected(index)
setIdCustomer(true)
})

.catch((err)=>{
    console.log(err)
    setIdCustomer(false)
})
}


   async function handleRegister(e){
        e.preventDefault()

        if(idCustomer){
            await firebase.firestore().collection('chamados').doc(id)
            .update({
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                status: status,
                complemento: complemento,
                userId: user.uid
            }).then(()=>{
                toast.success('Chamado editado com sucesso!')
                setCustomersSelected(0)
                setComplemento('')
                history.push('/dashboard')
            }).catch((err)=>{
                toast.error('Ops, erro ao registrar.')
            })

            return;
        }


    await firebase.firestore().collection('chamados').add({
        created: new Date(),
        cliente: customers[customerSelected].nomeFantasia,
        clienteId: customers[customerSelected].id,
        assunto: assunto,
        status: status,
        complemento: complemento,
        userId: user.uid
    }).then(()=>{
        toast.success('Chamado criado com sucesso!')
        setComplemento('');
        setCustomersSelected(0)
    }).catch((err)=>{
        toast.error('Ops, erro ao registrar, tente novamente.')
        console.log(err)
    })

    
    }
    //chama quando troca o assunto
    function handleChangeSelect(e){
        setAssunto(e.target.value)
        
    }
    //chama quando troca o status
    function handleOptionChange(e){
        setStatus(e.target.value)
        console.log(e.target.value)
    }


    function handleChangeCustomers(e) {
        setCustomersSelected(e.target.value);

    }

    return(
        <div>
    <Header/>
    
    <div className="content">
        <Title name="Novo Chamado">  
                <FiPlusCircle size={25}/>
        </Title>
        <div className="container">

        <form className="form-profile" onSubmit={handleRegister}>
        <label>Clientes</label>

        {loadCustomers ? ( 
            <input type="text" disabled={true} value="Carregando clientes..."/>
        ): (
            <select value={setCustomersSelected} onChange={handleChangeCustomers}>
            {customers.map((item, index)=>{
                return(
                    <option key={item.id} value={index}>
                        {item.nomeFantasia}
                    </option>
                )
            })}
        </select>
        )
        }

           
        <label>Assuntos</label>
        <select value={assunto} onChange={handleChangeSelect}>
            <option value="Suporte">Suporte</option>
            <option value="Visita técnica">Visita técnica</option>
            <option value="Financeiro">Financeiro</option>
        </select>


        <label>Status</label>
        <div className="status">
            <input type="radio" name="radio" value="Aberto" onChange={handleOptionChange} 
            checked={status === 'Aberto' }/>
            <span>Em aberto</span>

            <input type="radio" name="radio" value="Progresso" onChange={handleOptionChange}
            checked={status === 'Progresso' }
            />
            <span>Progresso</span>

            <input type="radio" name="radio" value="Atendido" onChange={handleOptionChange}
            checked={status === 'Atendido' }
            />
            <span>Atendido</span>
        </div>

        <label>Complemento</label>
        <textarea type="text" 
        placeholder="Descreva seu problema (Opcional)."
        value={complemento}
        onChange={(e)=>setComplemento(e.target.value)}
        />
        <button type="submit">Registrar</button>
        </form>

        </div>
    </div>
    </div>
        )
}