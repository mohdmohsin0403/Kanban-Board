// App.js
import './App.css';
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';
import { v4 } from 'uuid';
import addbutton from './add-button.png';
import raspberrysans from './raspberryicon.png';

function App() {
  const [text, setText] = useState('');
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Fetch data from the API when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        const data = await response.json();
        setTickets(data); // Assuming the API response is an array of tickets
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const [state, setState] = useState(
    JSON.parse(localStorage.getItem('kanban-board-state')) || {
      todo: {
        title: 'To-Do',
        items: [],
        css: {
          'border-color': '#f4b6ff',
        },
      },
      inprogress: {
        title: 'In-Progress',
        items: [],
        css: {
          'border-color': '#ffb6c1',
        },
      },
      done: {
        title: 'Done',
        items: [],
        css: {
          'border-color': '#c1ffb6',
        },
      },
      delete: {
        title: 'Delete',
        items: [],
        css: {
          'border-color': '#b6fff4',
        },
      },
    }
  );

  const [groupBy, setGroupBy] = useState('status'); // default grouping by status
  const [sortOption, setSortOption] = useState('priority'); // default sorting by priority

  const handleDragEnd = ({ destination, source }) => {
    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const itemcopy = { ...state[source.droppableId].items[source.index] };

    if (destination.droppableId === 'delete' && source.droppableId !== 'delete') {
      setState((prev) => {
        prev = { ...prev };
        prev[source.droppableId].items.splice(source.index, 1);
        return prev;
      });
    } else {
      setState((prev) => {
        prev = { ...prev };
        prev[source.droppableId].items.splice(source.index, 1);
        prev[destination.droppableId].items.splice(destination.index, 0, itemcopy);
        return prev;
      });
    }
  };

  const addItem = () => {
    if (!text.trim()) return; // Check if the text is not empty or contains only whitespaces

    const newItem = {
      id: v4(),
      name: text,
      priority: 0, // default priority
      time: new Date().toLocaleTimeString(), // current time
    };

    setState((prev) => ({
      ...prev,
      todo: {
        title: 'To-Do',
        items: [newItem, ...prev.todo.items],
      },
    }));

    setText('');
  };

  useEffect(() => {
    localStorage.setItem('kanban-board-state', JSON.stringify(state));
  }, [state]);

  const handleGroupByChange = (event) => {
    setGroupBy(event.target.value);
  };

  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div className="App">
      <br />
      <div className="username"> ~by Mohd Mohsin Khan </div>
      <div className="header">
        <img height="50px" width="50px" src={raspberrysans} alt="raspberry icon" />
        <h1 className="board-title">Kanban Board</h1>
      </div>
      <div className="add_todo">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
        />
        <button className="addbutton" onClick={addItem}>
          <img alt="" src={addbutton} height="20px" width="20px" />
        </button>
      </div>
      <div className="grouping-options">
        <label htmlFor="group-by">Group By:</label>
        <select id="group-by" value={groupBy} onChange={handleGroupByChange}>
          <option value="status">Status</option>
          <option value="user">User</option>
          <option value="priority">Priority</option>
        </select>
      </div>
      <div className="sorting-options">
        <label htmlFor="sort-by">Sort By:</label>
        <select id="sort-by" value={sortOption} onChange={handleSortOptionChange}>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>
      <div className="drop">
        <DragDropContext onDragEnd={handleDragEnd}>
          {_.map(state, (data, key) => {
            const groupedItems =
              groupBy === 'status'
                ? data.items
                : _.sortBy(
                    data.items,
                    [groupBy === 'user' ? 'user' : groupBy, sortOption, 'priority'],
                    (item) => (sortOption === 'priority' ? -item.priority : item.name)
                  );

            return (
              <div key={key} className="column">
                <h2 className="datatitle" style={data.css}>
                  {data.title}
                </h2>

                <Droppable droppableId={key}>
                  {(provided) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="droppable_column"
                      >
                        {groupedItems.map((element, index) => (
                          <Draggable
                            key={element.id}
                            index={index}
                            draggableId={element.id.toString()}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`draggable_item priority-${element.priority}`}
                              >
                                <div className="item-content">
                                  <div className="item-name">{element.name}</div>
                                  <div className="item-details">
                                    <span className="priority">Priority: {element.priority}</span>
                                    <span className="time">Added at: {element.time}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;
