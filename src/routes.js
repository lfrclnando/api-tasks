import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
{
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query; 
        const tasks = database.select(
            'tasks', search, {
                title: search,
                description: search,
            })    
        res.writeHead(200);
        res.end(JSON.stringify(tasks));
    }
},{
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
        const { title, description } = req.body

        if (!title) {
            return res.writeHead(400).end(
                JSON.stringify({ message: 'Coloque um Título na Tarefa!' })
            )
        }

        if (!description) {
            return res.writeHead(400).end(
                JSON.stringify({ message: 'Descreva a Tarefa!' })
            )
        }

        const task = {
            id: randomUUID(),
            title,
            description,
            completed_at: null,
            created_at: new Date(),
            updated_at: new Date()
        }

        database.insert('tasks', task)

        res.writeHead(201);
        res.end(JSON.stringify({
            message: 'Tarefa inserida com sucesso!',
            data: task
        }));
    }
},{
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
        const { id } = req.params
        const { title, description } = req.body

        if (!title && !description) {
            return res.writeHead(400).end(
                JSON.stringify({ message: "Título ou descrição não encontrado(s)!" })
            )
        }

        const [task] = database.select('tasks', { id })

        if (!task) {
            return res.writeHead(404).end(
                JSON.stringify({ message: "Tarefa não encontrada!" })
            )
        }
        
        // const updatedTask = {
        //     ...task,
        //     title,
        //     description,
        //     updated_at: new Date()
        // }

        // database.update('tasks', id, updatedTask)

        database.update('tasks', id, {
            title: title ?? task.title,
            description: description ?? task.description,
            updated_at: new Date()
        })

        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'Tarefa atualizada com sucesso!',
            data: task}));
    }
},
{
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
        const { id } = req.params

        const [task] = database.select('tasks', { id })

        if (!task) {
            return res.writeHead(404).end(JSON.stringify({
                message: "Tarefa não encontrada!" }));
        }

        // const completedTask = {
        //     ...task,
        //     completed_at: task.completed_at ? null : new Date(),
        //     updated_at: new Date()
        // }

        // database.update('tasks', id, completedTask)

        const isTaskCompleted = !!task.completed_at
        const completed_at = isTaskCompleted ? null : new Date();

        database.update('tasks', id, { completed_at })

        return res.writeHead(200).end(JSON.stringify({
            message: 'Tarefa concluída com sucesso!',
            data: completed_at
        }));
    }
},{
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
        const { id } = req.params
        const [task] = database.select('tasks', { id })

        if (!task) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "A tarefa não existe!" }));
            return;
        }

        database.delete('tasks', id)

        return res.writeHead(204).end();
    }
}
]