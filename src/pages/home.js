import React, { Component } from 'react';
import parseLinkHeader from 'parse-link-header';
import orderBy from 'lodash/orderBy';
import { Fade, Zoom } from 'react-reveal';
import {
    CSSTransition,
    TransitionGroup,
  } from 'react-transition-group';

import * as API from '../shared/http';
import Ad from '../components/ad/Ad';
import CreatePost from '../components/post/Create';
import Post from '../components/post/Post';
import Welcome from '../components/welcome/Welcome';

export class Home extends Component {
    constructor(props) {
        super(props);
        this.groupProps = {
            appear: false,
            enter: true,
            exit: true,
          };
        this.state = {
            posts: [],
            error: null,
            endpoint: `${process.env
                .ENDPOINT}/posts?_page=1&_sort=date&_order=DESC&_embed=comments&_expand=user&_embed=likes`,
            workersEndpoint: '/data/data.json',
            users: [],
            viewType: 'list'
        };
        this.getPosts = this.getPosts.bind(this);
        this.createNewPost = this.createNewPost.bind(this);
        this.getWorkers = this.getWorkers.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.addUser = this.addUser.bind(this);
    }
    componentDidMount() {
        this.getPosts();
        this.getWorkers();
    }
    getPosts() {
        API.fetchPosts(this.state.endpoint)
            .then(res => {
                return res.json().then(posts => {
                    const links = parseLinkHeader(res.headers.get('Link'));
                    this.setState(() => ({
                        posts: orderBy(this.state.posts.concat(posts), 'date', 'desc'),
                        endpoint: links.next.url
                    }));
                });
            })
            .catch(err => {
                this.setState(() => ({ error: err }));
            });
    }
    getWorkers() {
        fetch(this.state.workersEndpoint)
            .then(response => response.json())
            .then(users => {
                this.setState(() => ({users: users}))
            })
            .catch(error => {
                this.setState(() => ({ error: error }));
            });
    }
    deleteUser() {
        let newUsers = [...this.state.users];
        console.log(newUsers);
        newUsers.splice(0, 1);
        this.setState(() => ({users: newUsers}));
    }
    addUser() {
        let user = {
            name: "Димон",
            age: 34
        };
        let newUsers = [...this.state.users];
        newUsers.splice(0, 0, user);
        this.setState(() => ({users: newUsers}));
    }
    createNewPost(post) {
        post.userId = this.props.user.id;
        return API.createPost(post)
            .then(res => res.json())
            .then(newPost => {
                this.setState(prevState => {
                    return {
                        posts: orderBy(prevState.posts.concat(newPost), 'date', 'desc')
                    };
                });
            })
            .catch(err => {
                this.setState(() => ({ error: err }));
            });
    }
    render() {
        const { viewType } = this.state;
        let usersBlocks = this.state.users.map((user, index) => (
            <div className="user-panel" key={index}>{user.name} : {user.age}</div>
        ));
        return (
            <div className="home">
                <div>
                    {this.state.users.length && (
                        <div className="users">
                            <p>{viewType}</p>
                            {viewType == 'list' ? (
                                <p>Вывод списком</p> 
                            ) : (
                                <p>Вывод плиткой</p>
                            )}
                            <button className="btn" onClick={this.deleteUser}>Удалить</button>
                            <button className="btn" onClick={this.addUser}>Добавить</button>
                            <TransitionGroup className="todo-list">
                                {this.state.users.map( (item) => (
                                // The next line is what controls
                                // animated transitions
                                
                                    <div className="card">
                                        <div className="card-body justify-content-between">
                                            {item.name}
                                        </div>
                                    </div>
                                
                                ))}
                            </TransitionGroup>
                        </div>
                    )}
                </div>
                <div>
                    <CreatePost onSubmit={this.createNewPost} />
                    {this.state.posts.length && (
                        <div className="posts">
                            {this.state.posts.map(({ id }) => {
                                return <Post id={id} key={id} user={this.props.user} />;
                            })}
                        </div>
                    )}
                    <button className="block" onClick={this.getPosts}>
                        Load more posts
                    </button>
                </div>
                <div>
                    
                </div>
            </div>
        );
    }
}

export default Home;
