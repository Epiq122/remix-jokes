export default function NewJokeRoute() {
  return (
    <div>
      <p>Add your own joke!</p>
      <form action='post'>
        <div>
          <label>
            Name: <input type='text' name='name'></input>
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name='content'></textarea>
          </label>
        </div>
        <div>
          <button type='submit'>Add</button>
        </div>
      </form>
    </div>
  );
}
