import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Container, Form, Button, ListGroup , Modal } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTitle, setFilterTitle] = useState('');
  const [sortTitle, setSortTitle] = useState('asc');
  const [sortDate, setSortDate] = useState('asc');


  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
  });


  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    fetchTodos();
  }, [filterStatus, filterTitle, sortTitle, sortDate]);
  
  
  const fetchTodos = async () => {
    try {
      let url = `${API_URL}/todos`;

      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }

      if (filterTitle !== '') {
        url += `&title_like=${filterTitle}`;
      }

      url += `&_sort=title&_order=${sortTitle},${sortDate}`;

      const response = await axios.get(url);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (values, { resetForm }) => {
    try {
      const newTodo = {
        title: values.title,
        description: values.description,
        status: 'uncompleted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await axios.post(`${API_URL}/todos`, newTodo);
      setTodos([...todos, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id, values) => {
    try {
      const updates = {
        title: values.title,
        description: values.description,
        updated_at: new Date().toISOString(),
      };

      const response = await axios.patch(`${API_URL}/todos/${id}`, updates);
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const openEditModal = (todo) => {
    setSelectedTodo(todo);
  };
  
  const markCompleted = async (id) => {
    try {
      const updates = {
        status: 'completed',
        updated_at: new Date().toISOString(),
      };
  
      await updateTodo(id, updates);
    } catch (error) {
      console.error('Error marking todo as completed:', error);
    }
  };
  
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <Container>
      <h1 className="mt-4 mb-4">Todo App</h1>
      <Formik
        initialValues={{ title: '', description: '' }}
        validationSchema={validationSchema}
        onSubmit={addTodo}
      >
        {({ handleSubmit, handleChange, values, errors }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Field
                as={Form.Control}
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                isInvalid={!!errors.title}
              />
              <ErrorMessage name="title" component={Form.Control.Feedback} type="invalid" />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Field
                as={Form.Control}
                type="textarea"
                name="description"
                value={values.description}
                onChange={handleChange}
                isInvalid={!!errors.description}
              />
              <ErrorMessage name="description" component={Form.Control.Feedback} type="invalid" />
            </Form.Group>

            <Button type="submit">Add</Button>
          </Form>
        )}
      </Formik>

      <Form.Group controlId="filterStatus">
        <Form.Label>Filter by Status</Form.Label>
        <div>
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>{' '}
          <Button
            variant={filterStatus === 'completed' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </Button>{' '}
          <Button
            variant={filterStatus === 'uncompleted' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterStatus('uncompleted')}
          >
            Uncompleted
          </Button>
        </div>
      </Form.Group>

      <Form.Group controlId="filterTitle">
        <Form.Label>Filter by Title</Form.Label>
        <div>
          <Button
            variant={filterTitle === '' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterTitle('')}
          >
            Clear
          </Button>{' '}
          <Button
            variant="primary"
            onClick={() => fetchTodos()}
          >
            Apply
          </Button>
        </div>
        <Form.Control
          type="text"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        />
      </Form.Group>


      <Form.Group controlId="sortTitle">
        <Form.Label>Sort by Title</Form.Label>
        <div>
          <Button
            variant={sortTitle === 'asc' ? 'primary' : 'outline-primary'}
            onClick={() => setSortTitle('asc')}
          >
            Ascending
          </Button>{' '}
          <Button
            variant={sortTitle === 'desc' ? 'primary' : 'outline-primary'}
            onClick={() => setSortTitle('desc')}
          >
            Descending
          </Button>
        </div>
      </Form.Group>

      <Form.Group controlId="sortDate">
        <Form.Label>Sort by Date</Form.Label>
        <div>
          <Button
            variant={sortDate === 'asc' ? 'primary' : 'outline-primary'}
            onClick={() => setSortDate('asc')}
          >
            Ascending
          </Button>{' '}
          <Button
            variant={sortDate === 'desc' ? 'primary' : 'outline-primary'}
            onClick={() => setSortDate('desc')}
          >
            Descending
          </Button>
        </div>
      </Form.Group>


      <ListGroup>
        {todos.map((todo) => (
          <ListGroup.Item key={todo.id}>
            <h3>{todo.title}</h3>
            <p>{todo.description}</p>
            <p>Created At: {format(new Date(todo.created_at), 'dd/MM/yyyy')}</p>
            <p>Updated At: {format(new Date(todo.updated_at), 'dd/MM/yyyy')}</p>
            <Button variant="danger" onClick={() => deleteTodo(todo.id)}>Delete</Button>
            {todo.status !== 'completed' && (
              <Button onClick={() => markCompleted(todo.id)}>Mark Completed</Button>
            )}
            <Button onClick={() => openEditModal(todo)}>Update Todo</Button>

          </ListGroup.Item>
        ))}
      </ListGroup>
      <Modal show={selectedTodo !== null} onHide={() => setSelectedTodo(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Todo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTodo && (
            <Formik
              initialValues={{
                title: selectedTodo.title,
                description: selectedTodo.description,
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                updateTodo(selectedTodo.id, values);
                setSelectedTodo(null);
              }}
            >
              {({ handleSubmit, handleChange, values, errors }) => (
                <Form noValidate onSubmit={handleSubmit}>
                  <Form.Group controlId="title">
                    <Form.Label>Title</Form.Label>
                    <Field
                      as={Form.Control}
                      type="text"
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      isInvalid={!!errors.title}
                    />
                    <ErrorMessage name="title" component={Form.Control.Feedback} type="invalid" />
                  </Form.Group>

                  <Form.Group controlId="description">
                    <Form.Label>Description</Form.Label>
                    <Field
                      as={Form.Control}
                      type="textarea"
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      isInvalid={!!errors.description}
                    />
                    <ErrorMessage name="description" component={Form.Control.Feedback} type="invalid" />
                  </Form.Group>

                  <Button type="submit">Update</Button>
                </Form>
              )}
            </Formik>
          )}
        </Modal.Body>
    </Modal>

    
    </Container>
  );
}

export default TodoApp;
