"""Phase 9.11A

Revision ID: 123456789abc
Revises: 820fd5624517
Create Date: 2026-06-19 21:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '123456789abc'
down_revision = '820fd5624517'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Create user_feedback_affinities
    op.create_table('user_feedback_affinities',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dimension', sa.String(length=50), nullable=False),
        sa.Column('value', sa.String(length=100), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_user_feedback_affinities_user_id', 'user_feedback_affinities', ['user_id'], unique=False)
    op.create_index('ix_user_feedback_affinities_user_dim', 'user_feedback_affinities', ['user_id', 'dimension', 'value'], unique=True)

    # 2. Update outfit_feedback
    op.add_column('outfit_feedback', sa.Column('recommendation_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('outfit_feedback', sa.Column('rating', sa.String(length=50), nullable=True))
    op.add_column('outfit_feedback', sa.Column('feedback_weight', sa.Integer(), server_default='0', nullable=True))
    
    op.create_foreign_key('fk_outfit_feedback_rec_id', 'outfit_feedback', 'outfit_recommendations', ['recommendation_id'], ['id'], ondelete='CASCADE')
    op.create_index('ix_outfit_feedback_rec_created', 'outfit_feedback', [sa.text('recommendation_id'), sa.text('created_at DESC')], unique=False)
    
    op.alter_column('outfit_feedback', 'outfit_id', existing_type=postgresql.UUID(as_uuid=True), nullable=True)
    op.alter_column('outfit_feedback', 'feedback_type', existing_type=sa.String(length=50), nullable=True)
    op.alter_column('outfit_feedback', 'feedback_source', existing_type=sa.String(length=50), nullable=True)


def downgrade() -> None:
    op.alter_column('outfit_feedback', 'feedback_source', existing_type=sa.String(length=50), nullable=False)
    op.alter_column('outfit_feedback', 'feedback_type', existing_type=sa.String(length=50), nullable=False)
    op.alter_column('outfit_feedback', 'outfit_id', existing_type=postgresql.UUID(as_uuid=True), nullable=False)
    
    op.drop_index('ix_outfit_feedback_rec_created', table_name='outfit_feedback')
    op.drop_constraint('fk_outfit_feedback_rec_id', 'outfit_feedback', type_='foreignkey')
    
    op.drop_column('outfit_feedback', 'feedback_weight')
    op.drop_column('outfit_feedback', 'rating')
    op.drop_column('outfit_feedback', 'recommendation_id')
    
    op.drop_index('ix_user_feedback_affinities_user_dim', table_name='user_feedback_affinities')
    op.drop_index('ix_user_feedback_affinities_user_id', table_name='user_feedback_affinities')
    op.drop_table('user_feedback_affinities')
