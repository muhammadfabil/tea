const ProfileCard = ({ name, ttl, id, email, role }) => (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <p><strong>TTL:</strong> {ttl}</p>
      <p><strong>{role === "dosen" ? "NIP" : "NIM"}:</strong> {id}</p>
      <p><strong>Email:</strong> {email}</p>
    </div>
  );
  
  export default ProfileCard;
  