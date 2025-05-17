
const { supabase } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const sendConnectionRequest = async (req, res, next) => {
  try {
    const sender_id = req.user.id;
    const { receiverId: receiver_id, message } = req.body;
    if (sender_id === receiver_id) {
      throw new ApiError('You cannot send a connection request to yourself', 400);
    }
    const { data: receiver, error: receiverError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', receiver_id)
      .maybeSingle();

    if (receiverError || !receiver) {
      throw new ApiError('Receiver not found', 404);
    }
    const { data: existingRequest, error: checkError } = await supabase
      .from('connection_requests')
      .select('*')
      .or(`sender_id.eq.${sender_id},receiver_id.eq.${sender_id}`)
      .or(`sender_id.eq.${receiver_id},receiver_id.eq.${receiver_id}`)
      .maybeSingle();

    if (checkError) throw new ApiError(checkError.message, 400);

    if (existingRequest) {
      throw new ApiError('A connection request already exists between these users', 400);
    }
    const { data, error } = await supabase
      .from('connection_requests')
      .insert([{ sender_id, receiver_id, message, status: 'pending' }])
      .select();

    if (error) throw new ApiError(error.message, 400);

    res.status(201).json({
      message: 'Connection request sent successfully',
      connection_request: data[0]
    });
  } catch (error) {
    next(error);
  }
};
const getConnectionRequests = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { status } = req.query;
    let query = supabase
      .from('connection_requests')
      .select(`
        *,
        sender:sender_id(id, username, role, profile_picture),
        receiver:receiver_id(id, username, role, profile_picture)
      `)
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new ApiError(error.message, 400);
    const formattedRequests = data.map(request => ({
      id: request.id,
      status: request.status,
      message: request.message,
      created_at: request.created_at,
      updated_at: request.updated_at,
      sender: request.sender,
      receiver: request.receiver,
      is_outgoing: request.sender_id === user_id
    }));

    res.status(200).json({ connection_requests: formattedRequests });
  } catch (error) {
    next(error);
  }
};
const updateConnectionRequest = async (req, res, next) => {
  try {
    const request_id = req.params.id;
    const user_id = req.user.id;
    const { status } = req.body;
    const { data: request, error: checkError } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('id', request_id)
      .eq('receiver_id', user_id)
      .maybeSingle();

    if (checkError) throw new ApiError(checkError.message, 400);

    if (!request) {
      throw new ApiError('Connection request not found or you are not the receiver', 404);
    }
    if (!['accepted', 'declined'].includes(status)) {
      throw new ApiError('Status must be either accepted or declined', 400);
    }
    const { data, error } = await supabase
      .from('connection_requests')
      .update({ status })
      .eq('id', request_id)
      .select();

    if (error) throw new ApiError(error.message, 400);

    res.status(200).json({
      message: `Connection request ${status}`,
      connection_request: data[0]
    });
  } catch (error) {
    next(error);
  }
};
const deleteConnectionRequest = async (req, res, next) => {
  try {
    const request_id = req.params.id;
    const user_id = req.user.id;
    const { data: request, error: checkError } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('id', request_id)
      .eq('sender_id', user_id)
      .maybeSingle();

    if (checkError) throw new ApiError(checkError.message, 400);

    if (!request) {
      throw new ApiError('Connection request not found or you are not the sender', 404);
    }
    const { error } = await supabase
      .from('connection_requests')
      .delete()
      .eq('id', request_id);

    if (error) throw new ApiError(error.message, 400);

    res.status(200).json({
      message: 'Connection request deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendConnectionRequest,
  getConnectionRequests,
  updateConnectionRequest,
  deleteConnectionRequest
};
