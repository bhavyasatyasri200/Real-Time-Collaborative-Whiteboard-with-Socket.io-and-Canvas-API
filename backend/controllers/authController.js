exports.getSession = (req, res) => {

    const user = {
      id: "1",
      name: "Test User",
      email: "testuser@example.com",
      image: "https://i.pravatar.cc/150"
    };
  
    res.json({ user });
  
  };