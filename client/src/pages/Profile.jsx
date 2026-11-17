import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../api/httpClient.js";
import * as profileApi from "../api/profileApi.js";
import * as transactionApi from "../api/transactionApi.js";
import "../styles/pages/Profile.css";

// Format a date for display
function formatDate(date) {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// Format a price for display
function formatPrice(price) {
  return Number(price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

// Generate initials from a display name
function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function Profile() {
  const { userId } = useParams();
  const { currentUser } = useAuth();

  const isOwnProfile =
    !userId ||
    userId.toLowerCase() ===
      currentUser.userId.toLowerCase();

  return (
    <ProfileContent
      key={`${currentUser.userId}:${userId ?? "me"}`}
      userId={userId}
      currentUser={currentUser}
      isOwnProfile={isOwnProfile}
    />
  );
}

function ProfileContent({
  userId,
  currentUser,
  isOwnProfile
}) {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [transactionError, setTransactionError] =
    useState("");
  const [success, setSuccess] = useState("");

  // Load the requested profile
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const data = isOwnProfile
          ? await profileApi.getOwnProfile()
          : await profileApi.getProfile(userId);

        if (cancelled) {
          return;
        }

        setProfile(data);
        setName(data.name);
        setBio(data.bio ?? "");
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId, isOwnProfile]);

  // Load private transaction history
  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      if (!isOwnProfile) {
        return;
      }

      try {
        const data =
          await transactionApi.getOwnTransactions();

        if (!cancelled) {
          setTransactions(data);
        }
      } catch (error) {
        if (!cancelled) {
          setTransactionError(getErrorMessage(error));
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [isOwnProfile]);

  // Save profile changes
  async function handleSave(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const updatedProfile =
        await profileApi.updateProfile({
          name,
          bio
        });

      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setBio(updatedProfile.bio);
      setIsEditing(false);

      setSuccess("Profile updated successfully.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  // Cancel profile editing
  function handleCancel() {
    setName(profile.name);
    setBio(profile.bio ?? "");
    setIsEditing(false);
    setError("");
  }

  if (isLoading) {
    return (
      <main className="profile-page">
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page">
        <Link to="/">Back to marketplace</Link>
        <p className="profile-error">
          {error || "Profile could not be loaded."}
        </p>
      </main>
    );
  }

  const listings = profile.listings ?? [];

  const sales = transactions.filter(
    (transaction) =>
      transaction.sellerId === currentUser.userId
  );

  const purchases = transactions.filter(
    (transaction) =>
      transaction.buyerId === currentUser.userId
  );

  return (
    <main className="profile-page">
      <nav className="profile-navigation">
        <Link to="/">Back to marketplace</Link>

        {!isOwnProfile && (
          <Link to="/profile">My profile</Link>
        )}
      </nav>

      {error && (
        <p className="profile-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="profile-success" role="status">
          {success}
        </p>
      )}

      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(profile.name)}
          </div>

          <div className="profile-identity">
            <h1>{profile.name}</h1>

            <p className="profile-username">
              @{profile.userId}
            </p>

            <p className="profile-muted">
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>

          {isOwnProfile && !isEditing && (
            <button
              type="button"
              className="profile-button"
              onClick={() => {
                setIsEditing(true);
                setSuccess("");
                setError("");
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form
            className="profile-form"
            onSubmit={handleSave}
          >
            <label htmlFor="profile-name">
              Display name
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              maxLength={100}
              required
              disabled={isSaving}
              onChange={(event) =>
                setName(event.target.value)
              }
            />

            <label htmlFor="profile-bio">
              Biography
            </label>

            <textarea
              id="profile-bio"
              value={bio}
              maxLength={1000}
              rows={5}
              disabled={isSaving}
              onChange={(event) =>
                setBio(event.target.value)
              }
            />

            <p className="profile-muted">
              {bio.length}/1000 characters
            </p>

            <div className="profile-actions">
              <button
                type="submit"
                className="profile-button"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="profile-button-secondary"
                disabled={isSaving}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-about">
            <h2>About</h2>

            <p className="profile-bio">
              {profile.bio ||
                "This user has not added a biography."}
            </p>
          </div>
        )}

        <div className="profile-stats">
          <div className="profile-stat">
            <strong>{listings.length}</strong>
            <span>Listings</span>
          </div>

          {isOwnProfile && !transactionError && (
            <>
              <div className="profile-stat">
                <strong>{sales.length}</strong>
                <span>Sales</span>
              </div>

              <div className="profile-stat">
                <strong>{purchases.length}</strong>
                <span>Purchases</span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="profile-card">
        <h2>
          {isOwnProfile
            ? "My Listings"
            : `${profile.name}'s Listings`}
        </h2>

        {listings.length === 0 ? (
          <p className="profile-muted">
            No listings to display.
          </p>
        ) : (
          <div className="profile-listings">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="profile-listing"
              >
                {listing.image_path ? (
                  <img
                    src={listing.image_path}
                    alt={listing.title}
                    className="profile-listing-image"
                  />
                ) : (
                  <div className="profile-listing-placeholder">
                    No image available
                  </div>
                )}

                <div className="profile-listing-content">
                  <h3>{listing.title}</h3>

                  <p className="profile-listing-price">
                    {formatPrice(listing.price)}
                  </p>

                  <p className="profile-muted">
                    {listing.category}
                  </p>

                  <span
                    className={
                      listing.status === "active"
                        ? "profile-status-active"
                        : "profile-status-other"
                    }
                  >
                    {listing.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {isOwnProfile && (
        <section className="profile-card">
          <h2>Transaction History</h2>

          {transactionError ? (
            <p className="profile-error">
              {transactionError}
            </p>
          ) : transactions.length === 0 ? (
            <p className="profile-muted">
              No completed transactions.
            </p>
          ) : (
            <div className="profile-transactions">
              {transactions.map((transaction) => {
                const isSale =
                  transaction.sellerId ===
                  currentUser.userId;

                return (
                  <div
                    className="profile-transaction"
                    key={transaction.id}
                  >
                    <div>
                      <Link
                        to={`/listings/${transaction.listingId}`}
                      >
                        {transaction.listingTitle}
                      </Link>

                      <p className="profile-muted">
                        {isSale
                          ? "Sold to "
                          : "Purchased from "}

                        <Link
                          to={`/profiles/${
                            isSale
                              ? transaction.buyerId
                              : transaction.sellerId
                          }`}
                        >
                          {isSale
                            ? transaction.buyerName
                            : transaction.sellerName}
                        </Link>
                      </p>

                      <p className="profile-muted">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>

                    <div
                      className={
                        isSale
                          ? "profile-transaction-sale"
                          : "profile-transaction-purchase"
                      }
                    >
                      {isSale ? "+" : "-"}
                      {formatPrice(transaction.salePrice)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}